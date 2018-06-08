import { wrap } from './../util.js';

export function cycle(width, height, input, animationPosition) {
  const offset = Math.floor(animationPosition * 255);
  return input.map(i => wrap(i - offset, 255));
}