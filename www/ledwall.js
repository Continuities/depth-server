import { rgbToHsl, hslToRgb } from './colour.js';
import { wrap } from './util.js';
import * as fgProcessors from './processors/foreground.js';
import * as bgProcessors from './processors/background.js';

const $width = Symbol('width');
const $height = Symbol('height');
const $colours = Symbol('colours');
const $parent = Symbol('parent');
const $background = Symbol('background');
const $depths = Symbol('depths');
const $elements = Symbol('elements');

const FRAME_RATE = 30; // per second
const ANIM_RATE = 0.01; // Higher is faster
const FADE_RATE = 5; // Higher is slower
const PROCESSORS = [];


function getColours(width, height, background, depths) {
  // The base colour is the background offset by the depth
  const base = depths.map(depth => {
    return [
      wrap(background[0] - (depth / 255), 1),
      background[1],
      background[2]
    ];
  });

  // Apply all post-processors
  return PROCESSORS.reduce((current, processor) => processor(width, height, current), base);
}

function makeList(length, fillFunc) {
  const list = new Array(length);
  for (let i = 0; i < length; i++) {
    list[i] = fillFunc(i);
  }
  return list;
}

export default class {

  constructor({ width, height, parentElement }) {
    this[$width] = width;
    this[$height] = height;
    this[$parent] = parentElement;
    this[$background] = [ 0, 1, 0.5 ]; // hsl

    setInterval(() => {
      this[$background][0] = wrap(this[$background][0] + ANIM_RATE, 1);
    }, Math.round(1000 / FRAME_RATE));

    const listSize = width * height;
    this[$colours] = makeList(listSize, () => this[$background]);
    this[$depths] = makeList(listSize, () => 0);

    this[$elements] = makeList(listSize, () => {
      const el = document.createElement('div');
      el.className = 'led';
      return el;
    });

    const container = this[$elements].reduce((c, div) => {
      c.appendChild(div);
      return c;
    }, document.createElement('div'));
    container.className = 'led-container';
    parentElement.appendChild(container);

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
      const delta = Math.abs(Math.round((depth - depths[i]) / FADE_RATE));
      //const delta = 30;
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

    const els = this[$elements];
    getColours(this[$width], this[$height], this[$background], this[$depths])
        .forEach(([h, s, l], i) => {
      const [ r, g, b ] = hslToRgb(h, s, l);
      els[i].style.backgroundColor = `rgb(${r},${g},${b})`;
    });
  }
}