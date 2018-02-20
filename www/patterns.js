export function flat(rX, rY) {
  return 0;
}

export function horizontal(rX, rY) {
  return rY;
}

export function vertical(rX, rY) {
  return rX;
}

export function diamond(rX, rY) {
  return rX + rY;
}

export function circle(rX, rY) {
  return Math.sqrt(Math.pow(rX, 2) + Math.pow(rY, 2));
}