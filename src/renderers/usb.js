const $width = Symbol('width');
const $height = Symbol('height');

export default class {
  constructor({ width, height }) {
    this[$width] = width;
    this[$height] = height;
  }

  render(colours) {
    // TODO Send down USB
    console.log(`Sending ${colours}`);
  }
}