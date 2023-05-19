const socketIO = require('socket.io')
const { getWatchlist, generateCacheKey } = require('../utils/watchlist')
const getCurrentDateString = require('../utils/getCurrentDateString')
const { isWithinTimeRange } = require('../utils/isWithinTimeRange')
const NodeCache = require('node-cache')
const User = require('../models/User')
const Transaction = require('../models/Transaction')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET
const loginCache = new NodeCache({ stdTTL: 0 })
const transOverviewCache = new NodeCache({ stdTTL: 0 })

const authenticateSocket = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return {
      id: decoded.id,
      role: decoded.role,
      ref_code: decoded.ref_code,
      username: decoded.username,
    }
  } catch (error) {
    return { error: error }
  }
}

const authorizeSocket = (role, allowedRoles) => {
  return allowedRoles.includes(role)
}

function batchID() {
  const date = new Date()
  let batch_id = null
  if (isWithinTimeRange(date, 0, 0, 14, 10)) {
    batch_id = 1
  } else if (isWithinTimeRange(date, 14, 10, 17, 45)) {
    batch_id = 2
  } else if (isWithinTimeRange(date, 17, 45, 23, 59)) {
    batch_id = 3
  }

  return batch_id
}

const getTransactionOverview = async (username) => {
  const user = await User.findOne({ username: username })
  const from = getCurrentDateString()
  const to = getCurrentDateString()

  const startOfDay = new Date(from)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(to)
  endOfDay.setHours(23, 59, 59, 999)
  const createdAt = { $gte: startOfDay, $lte: endOfDay }

  let transact_query = {}
  transact_query.createdAt = createdAt
  transact_query.batch_id = batchID()

  let user_query = {}
  user_query['user.ref_code'] = user.ref_code

  const aggregateQuery = Transaction.aggregate([
    // distinct by user
    // filter by transaction (createdAt, batch_id), by user (username, ref_code)
    {
      $match: transact_query,
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: {
        path: '$user',
      },
    },
    {
      $project: {
        'user.password': 0,
      },
    },
    {
      $match: user_query,
    },
    {
      $lookup: {
        from: 'transactions',
        localField: 'user._id',
        foreignField: 'user',
        as: 'transactions',
      },
    },
    {
      $addFields: {
        total_amount: {
          $sum: '$transactions.total_amount',
        },
        total_win_amount: {
          $sum: '$transactions.total_win_amount',
        },
        actual_win_amount: {
          $sum: '$transactions.actual_win_amount',
        },
        latest_transaction: {
          $max: '$transactions.createdAt',
        },
      },
    },
    {
      $group: {
        _id: '$user._id',
        user: { $first: '$user' },
        // transactions: { $first: "$transactions" },
        total_amount: { $first: '$total_amount' },
        total_win_amount: {
          $first: '$total_win_amount',
        },
        actual_win_amount: {
          $first: '$actual_win_amount',
        },
        latest_transaction: {
          $first: '$latest_transaction',
        },
      },
    },
    {
      $facet: {
        totalCount: [{ $count: 'count' }],
        grandTotalAmount: [
          {
            $group: {
              _id: null,
              total: { $sum: '$total_amount' },
            },
          },
        ],
        grandTotalWinAmount: [
          {
            $group: {
              _id: null,
              total: { $sum: '$total_win_amount' },
            },
          },
        ],
        grandActualWinAmount: [
          {
            $group: {
              _id: null,
              total: { $sum: '$actual_win_amount' },
            },
          },
        ],
      },
    },
  ])

  const result = await aggregateQuery.exec()
  const total = result[0].totalCount[0]?.count || 0
  const grandTotalAmount = result[0].grandTotalAmount[0]?.total || 0
  const grandTotalWinAmount = result[0].grandTotalWinAmount[0]?.total || 0
  const grandActualWinAmount = result[0].grandActualWinAmount[0]?.total || 0

  return {
    message: 'Transaction overview fetched successfully',
    total,
    grandTotalAmount,
    grandTotalWinAmount,
    grandActualWinAmount,
  }
}

const io = socketIO({
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
})

io.on('connection', (socket) => {
  const changeStream = Transaction.watch()
  let lastEmitTime = Date.now()
  console.log(`$User ${socket.id} connected`)

  changeStream.on('change', async (change) => {
    // Only emit the change if more than 10 seconds have passed since the last emit
    if (Date.now() - lastEmitTime > 10000) {
      console.log('test')
      for (const username of transOverviewCache.keys()) {
        console.log(
          '🚀 ~ file: socket.js:198 ~ changeStream.on ~ username:',
          username,
        )
        const userSocketId = transOverviewCache.get(username)
        console.log(
          '🚀 ~ file: socket.js:202 ~ changeStream.on ~ userSocketId:',
          userSocketId,
        )
        const data = await getTransactionOverview(username)
        io.to(userSocketId).emit('admin:transactionOverview', data)
      }
      lastEmitTime = Date.now()
    }
  })

  socket.on('watchlist', async (data) => {
    const { token } = data
    const { role } = await authenticateSocket(token)
    console.log(role)
    if (!role) {
      socket.emit('watchlist', { error: 'Authentication failed' })
      return
    }

    const allowedRoles = ['super-admin', 'admin', 'user']
    if (!authorizeSocket(role, allowedRoles)) {
      socket.emit('watchlist', {
        error: 'Forbidden: You do not have permission to perform this action',
      })
      return
    }

    socket.emit('watchlist', getWatchlist(generateCacheKey()))
  })

  socket.on('login', async (credentials) => {
    const { username, password } = credentials

    const existingSession = loginCache.get(username)
    if (existingSession) {
      socket.emit('login', { error: 'User is already connected' })
      return
    }

    const user = await User.findOne({ username })
    if (!user) {
      socket.emit('login', { error: 'Invalid credentials' })
      return
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      socket.emit('login', { error: 'Invalid credentials' })
      return
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        ref_code: user.ref_code ? user.ref_code : null,
        username: user.username,
      },
      JWT_SECRET,
      {
        expiresIn: '1d',
      },
    )

    loginCache.set(username, socket.id)

    socket.emit('login', {
      message: 'Logged in successfully',
      token,
      id: user._id,
      role: user.role,
      ref_code: user.ref_code ? user.ref_code : null,
      username: user.username,
    })
  })

  socket.on('logout', (data) => {
    console.log('User logged out')

    for (const username of loginCache.keys()) {
      const userSocketId = loginCache.get(username)
      if (userSocketId === data) {
        loginCache.del(username)
        break
      }
    }
  })

  socket.on('admin:transactionOverview', async (data) => {
    const { token } = data
    const { role, username } = await authenticateSocket(token)

    if (!role) {
      socket.emit('admin:transactionOverview', {
        error: 'Authentication failed',
      })
      return
    }

    const allowedRoles = ['admin']
    if (!authorizeSocket(role, allowedRoles)) {
      socket.emit('admin:transactionOverview', {
        error: 'Forbidden: You do not have permission to perform this action',
      })
      return
    }

    for (const username of transOverviewCache.keys()) {
      const userSocketId = transOverviewCache.get(username)
      if (userSocketId !== socket.id) {
        transOverviewCache.del(username)
        break
      }
    }

    transOverviewCache.set(username, socket.id)

    const trans_overview = await getTransactionOverview(username)
    socket.emit('admin:transactionOverview', trans_overview)
  })

  socket.on('disconnect', () => {
    console.log('A user disconnected')

    for (const username of loginCache.keys()) {
      const userSocketId = loginCache.get(username)
      if (userSocketId === socket.id) {
        loginCache.del(username)
        break
      }
    }
  })
})

module.exports = io
