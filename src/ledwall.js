import { rgbToHsl, hslToRgb } from './colour.js';
import { makeList, wrap } from './util.js';
import * as fgProcessors from './processors/foreground.js';
import * as bgProcessors from './processors/background.js';

const $width = Symbol('width');
const $height = Symbol('height');
const $colours = Symbol('colours');
const $background = Symbol('background');
const $depths = Symbol('depths');
const $renderer = Symbol('renderer');

const FRAME_RATE = 30; // per second
const ANIM_RATE = 0.01; // Higher is faster
const FADE_RATE = 5; // Higher is slower
const PROCESSORS = [];

function getColours(width, height, background, depths) {

  // Apply all processors to the depth-map
  const processedDepths = PROCESSORS.reduce((current, processor) => processor(width, height, current), depths);

  // The base colour is the background offset by the depth
  return processedDepths.map(depth => {
    return [
      wrap(background[0] - (depth / 255), 1),
      background[1],
      background[2]
    ];
  });
}

export default class {

  constructor({ width, height, renderer }) {

    this[$renderer] = renderer;
    this[$width] = width;
    this[$height] = height;
    this[$background] = [ 0, 1, 0.5 ]; // hsl

    setInterval(() => {
      this[$background][0] = wrap(this[$background][0] + ANIM_RATE, 1);
    }, Math.round(1000 / FRAME_RATE));

    const listSize = width * height;
    this[$colours] = makeList(listSize, () => this[$background]);
    this[$depths] = makeList(listSize, () => 0);

    this.render();
  }

  /**
   * Sets the depth value of an led
   * @param {number} i the index to set
   * @param {number} depth the offset [0, 255]
   */
  setDepth(i, depth) {
    const depths = this[$depths];

    if (FADE_RATE > 0) {
      const delta = Math.ceil(Math.abs((depth - depths[i]) / FADE_RATE));
      if (depth > depths[i]) {
        depths[i] = Math.min(depth, depths[i] + delta);
      }
      else if (depth < depths[i]) {
        depths[i] = Math.max(depth, depths[i] - delta);
      }
    }
    else {
      depths[i] = depth;
    }
  }

  render() {
    this[$renderer].render(getColours(this[$width], this[$height], this[$background], this[$depths]).map(hsl => hslToRgb(...hsl)));
  }
}