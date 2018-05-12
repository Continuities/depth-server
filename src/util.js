export function wrap(input, max) {
  if (input > max) {
    return input % max;
  }
  if (input < 0) {
    return input + max;
  }
  return input;
}

export function indexToCoords(width, index) {
  return [index % width, Math.floor(index / width)];
}

export function coordsToIndex(width, x, y) {
  return x + (width * y);
}

export function makeList(length, fillFunc) {
  const list = new Array(length);
  for (let i = 0; i < length; i++) {
    list[i] = fillFunc(i);
  }
  return list;
}

function formatDate(date) {
  return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
}

export function log(namespace, category, message) {
  console[category]('[' + formatDate(new Date()) + '] [' + namespace.toUpperCase() + '] ' + message);
}