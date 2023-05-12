const NodeCache = require("node-cache");
const watchlistCache = new NodeCache({ stdTTL: 0 });

const { getRemainingConstraints } = require("../utils/getRemainingConstraint");
const { batchID } = require("../utils/isWithinTimeRange");
const getCurrentDateString = require("../utils/getCurrentDateString");

function generateCacheKey() {
  const batch_id = batchID();
  const currentDate = getCurrentDateString();
  const cache_key = `${currentDate}:${batch_id}`;

  return cache_key;
}

function isString(value) {
  return typeof value === "string";
}

function createWatchlistKeyObject(bet) {
  const bet_type = isString(bet.bet_type)
    ? bet.bet_type
    : bet.bet_type.bet_type;
  return `${bet_type}:${parseInt(bet.bet_num)}`;
}

function initializeWatchlist() {
  const batch_id = batchID();
  const currentDate = getCurrentDateString();
  const cache_key = generateCacheKey();

  resetWatchlist(cache_key);

  async function fetchData() {
    try {
      const res = await getRemainingConstraints(currentDate, batch_id);
      return res;
    } catch (error) {
      console.error("Error calling getRemainingConstraints:", error);
      return {
        status: "error",
        message: error.message,
      };
    }
  }

  fetchData().then((data) => {
    for (let res in data.result) {
      updateWatchlist(cache_key, data.result[res]);
    }
  });
}

function updateWatchlist(name, bet) {
  const key = createWatchlistKeyObject(bet);
  const watchlist = getWatchlist(name);
  const currentBetAmount = watchlist[key]?.total_amt || 0;

  const betAmount = parseInt(bet.bet_amt) || parseInt(bet.total_amt);
  const amtConst = parseInt(bet.amt_const);

  watchlist[key] = {
    ...watchlist[key],
    total_amt: currentBetAmount + betAmount,
    amt_const: amtConst,
    remaining_const: amtConst - (currentBetAmount + betAmount),
  };

  setWatchlist(name, watchlist);
}

function getWatchlist(name) {
  const list = watchlistCache.get(name) || {};
  return list;
}

function setWatchlist(name, watchlist) {
  watchlistCache.set(name, watchlist); // key should be date and batch_id
}

function resetWatchlist(name) {
  watchlistCache.del(name);
}

function getWatchlistKeys() {
  return watchlistCache.keys();
}

module.exports = {
  createWatchlistKeyObject,
  generateCacheKey,
  getWatchlistKeys,
  updateWatchlist,
  getWatchlist,
  setWatchlist,
  resetWatchlist,
  initializeWatchlist,
};
