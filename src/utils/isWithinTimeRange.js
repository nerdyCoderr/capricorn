function isWithinTimeRange(date, startHour, startMinute, endHour, endMinute) {
  const currentHour = date.getHours();
  const currentMinute = date.getMinutes();
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;
  const currentTime = currentHour * 60 + currentMinute;

  return currentTime >= startTime && currentTime <= endTime;
}

function batchID() {
  const date = new Date();
  let batch_id = null;
  if (isWithinTimeRange(date, 0, 0, 13, 45)) {
    batch_id = 1;
  } else if (isWithinTimeRange(date, 14, 10, 17, 45)) {
    batch_id = 2;
  } else if (isWithinTimeRange(date, 18, 0, 23, 59)) {
    batch_id = 3;
  }

  return batch_id;
}

module.exports = { isWithinTimeRange, batchID };
