function isWithinTimeRange(date, [startHour, startMinute, endHour, endMinute]) {
  const currentHour = date.getHours();
  const currentMinute = date.getMinutes();
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;
  const currentTime = currentHour * 60 + currentMinute;

  return currentTime >= startTime && currentTime <= endTime;
}

function batchID(
  batches = [
    [6, 0, 13, 45],
    [14, 10, 16, 45],
    [17, 10, 20, 45],
  ]
) {
  const date = new Date();
  let batch_id = null;
  if (isWithinTimeRange(date, batches[0])) {
    batch_id = 1;
  } else if (isWithinTimeRange(date, batches[1])) {
    batch_id = 2;
  } else if (isWithinTimeRange(date, batches[2])) {
    batch_id = 3;
  }

  return batch_id;
}

module.exports = { isWithinTimeRange, batchID };
