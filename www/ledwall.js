import { rgbToHsl, hslToRgb } from './colour.js';
import * as patterns from './patterns.js';

const $width = Symbol('width');
const $height = Symbol('height');
const $colours = Symbol('colours');
const $parent = Symbol('parent');
const $baseColour = Symbol('baseColour');
const $depths = Symbol('depths');

const FRAME_RATE = 30; // per second
const ANIM_RATE = 0.01; // Higher is faster
const FADE_RATE = 5; // Higher is slower
const PATTERN = patterns.circle;

function wrap(input, max) {
  if (input > max) {
    return input % max;
  }
  if (input < 0) {
    return input + max;
  }
  return input;
}

export default class {

  constructor({ width, height, parentElement }) {
    this[$width] = width;
    this[$height] = height;
    this[$parent] = parentElement;
    this[$baseColour] = [ 0, 1, 0.5 ]; // hsl

    setInterval(() => {
      this[$baseColour][0] = wrap(this[$baseColour][0] + ANIM_RATE, 1);
    }, Math.round(1000 / FRAME_RATE));

    const colours = this[$colours] = new Array(width * height);
    colours.fill(this[$baseColour]);
    const depths = this[$depths] = new Array(width * height);
    depths.fill(0);

    this.render();
  }

  /**
   * Sets the depth value of an led
   * @param {number} i the index to set
   * @param {number} depth the offset [0, 255]
   */
  setDepth(i, depth) {
    const base = this[$baseColour];
    const depths = this[$depths];

    //if (depth === 0 && DECAY > 0 && this[$depths][i] > 0) {
    //  // decay the depth
    //  depth = Math.max(0, this[$depths][i] - DECAY);
    //}

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

    // TODO: Probably shouldn't set colour in this function
    const width = this[$width], height = this[$height];
    const rX = Math.abs((i % width) - (width / 2)) / (width / 2);
    const rY = Math.abs((i / width) - (height / 2)) / (height / 2);

    this[$colours][i] = [
        wrap(base[0] - PATTERN(rX, rY) + (depths[i] / 255), 1),
        base[1],
        base[2]
    ];

  }

  render() {
    const container = this[$colours].map(([h, s, l]) => {
      const [ r, g, b ] = hslToRgb(h, s, l);
      const el = document.createElement('div');
      el.className = 'led';
      el.style.backgroundColor = `rgb(${r},${g},${b})`;
      return el;
    }).reduce((c, ledElement) => {
      c.appendChild(ledElement);
      return c;
    }, document.createElement('div'));

    container.className = 'led-container';
    this[$parent].innerHTML = '';
    this[$parent].appendChild(container);
  }
}