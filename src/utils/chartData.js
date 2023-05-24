const getTransactionOverview = require("../utils/getTransactionOverview");
const getCurrentDateString = require("./getCurrentDateString");

async function chartData(username, days) {
  let chart_data = {};
  let trans;
  let hour;
  let timeFormat;
  let newDateString;

  const dateString = getCurrentDateString();
  const date = new Date(dateString);

  if (days === 1) {
    for (let x = 6; x <= 21; x++) {
      trans = await getTransactionOverview(
        username,
        dateString,
        dateString,
        x,
        x,
        null
      );
      hour = x;
      date.setHours(hour, 0, 0, 0);
      timeFormat = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      chart_data[timeFormat] = trans;
    }
    return {
      message: "1 day historical data",
      chart_data: chart_data,
    };
  } else {
    for (let x = 0; x <= 6; x++) {
      minus = x ? 1 : 0;
      date.setDate(date.getDate() - minus);
      newDateString = date.toISOString().split("T")[0];

      trans = await getTransactionOverview(
        username,
        newDateString,
        newDateString,
        6,
        21,
        null
      );

      chart_data[newDateString] = trans;
    }
    return {
      message: `${days} days historical data`,
      chart_data: chart_data,
    };
  }
}

module.exports = chartData;
