import { wrap } from './../util.js';

export const horizontal = fromRadii((rX, rY) => rY);
export const vertical = fromRadii((rX, rY) => rX);
export const diamond = fromRadii((rX, rY) => rX + rY);
export const circle = fromRadii((rX, rY) => Math.sqrt(Math.pow(rX, 2) + Math.pow(rY, 2)));

function fromRadii(calculator) {
  return (width, height, input) => input.map((colour, i) => {
    const rX = Math.abs((i % width) - (width / 2)) / (width / 2);
    const rY = Math.abs((i / width) - (height / 2)) / (height / 2);
    return [
      wrap(colour[0] - calculator(rX, rY), 1),
      colour[1],
      colour[2]
    ];
  });
}