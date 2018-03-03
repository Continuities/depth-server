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