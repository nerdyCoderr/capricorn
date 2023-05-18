import api from './api';
import token from './token';

import { message, notification } from 'antd';

const userLogin = (params, callback = null) => {
  api
    .post('/login', JSON.stringify(params), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((res) => {
      message.success(res.data.message);
      callback(res);
    })
    .catch((err) => {
      if (err) {
        message.error(err.response.data.message);
        if (err.response.status === 401 || err.response.status === 422) {
          callback(err.response);
        }
      }
    });
};

const registerUserAccount = (params, callback = null) => {
  const newToken = token();

  api
    .post('/users/signup', JSON.stringify(params), {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': newToken,
      },
    })
    .then((res) => {
      message.success(res.data.message);
      callback(res);
    })
    .catch((err) => {
      if (err) {
        message.error(err.response.data.message);
        if (err.response.status === 401 || err.response.status === 422) {
          callback(err.response);
        }
      }
    });
};
const registerUserAccountbyAdmin = (params, callback = null) => {
  const newToken = token();

  api
    .post('/admins/user-signup', JSON.stringify(params), {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': newToken,
      },
    })
    .then((res) => {
      message.success(res.data.message);
      callback(res);
    })
    .catch((err) => {
      if (err) {
        message.error(err.response.data.message);
        if (err.response.status === 401 || err.response.status === 422) {
          callback(err.response);
        }
      }
    });
};

const getBetType = (callback = null) => {
  const newToken = token();

  api
    .get('/bet-types', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': newToken,
      },
    })
    .then((res) => {
      // message.success(res.data.message);
      callback(res);
    })
    .catch((err) => {
      if (err) {
        message.error(err.response.data.message);
        if (err.response.status === 401 || err.response.status === 422) {
          callback(err.response);
        }
      }
    });
};

const createBet = (params, callback = null) => {
  const newToken = token();

  api
    .post('/users/bets', JSON.stringify({ bets: params }), {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': newToken,
      },
    })
    .then((res) => {
      message.success(res.data.message);
      callback(res);
    })
    .catch((err) => {
      if (err) {
        const { exceed } = err.response.data;
        if (!exceed) {
          message.error(err.response.data.message);
        } else {
          Object.keys(exceed).map((item) => {
            const splitItem = item.split(':');

            const title = `Bet Type: ${splitItem[0]}`;
            const message = `Bet Number: ${splitItem[1]} exceeded the limit`;
            openNotification(title, message);
          });
        }
        callback(err.response);
      }
    });
};

export const openNotification = (title, message) => {
  notification.error({
    message: title,
    description: message,
    onClick: () => {
      console.log('Notification Clicked!');
    },
  });
};

const getBetList = (params, callback = null) => {
  const newToken = token();

  api
    .get(`/admins/bets/${params}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': newToken,
      },
    })
    .then((res) => {
      message.success(res.data.message);
      callback(res);
    })
    .catch((err) => {
      callback(err.response);
    });
};

const getBetListUser = (params, callback = null) => {
  const newToken = token();

  api
    .get(`/users/bets/${params}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': newToken,
      },
    })
    .then((res) => {
      message.success(res.data.message);
      callback(res);
    })
    .catch((err) => {
      if (err) {
        message.error(err.response.data.message);
        if (err.response.status === 401 || err.response.status === 422) {
          callback(err.response);
        }
      }
    });
};

const getTransactionNO = (params, callback = null) => {
  const newToken = token();
  console.log(params);

  api
    .get('/bets/get_bets', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': newToken,
      },
      // data: JSON.stringify(data),
    })
    .then((res) => {
      message.success(res.data.message);
      callback(res);
    })
    .catch((err) => {
      if (err) {
        console.log(err);
      }
    });
};

export {
  registerUserAccountbyAdmin,
  userLogin,
  registerUserAccount,
  getBetType,
  createBet,
  getTransactionNO,
  getBetList,
  getBetListUser,
};
