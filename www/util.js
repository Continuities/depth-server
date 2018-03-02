export function wrap(input, max) {
  if (input > max) {
    return input % max;
  }
  if (input < 0) {
    return input + max;
  }
  return input;
}