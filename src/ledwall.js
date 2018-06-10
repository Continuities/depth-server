import { rgbToHsl, hslToRgb } from './colour.js';
import { makeList, wrap } from './util.js';
import * as patterns from './processors/patterns.js';
import * as effects from './processors/effects.js';
import * as animations from './processors/animations.js';

const $width = Symbol('width');
const $height = Symbol('height');
const $colours = Symbol('colours');
const $depths = Symbol('depths');
const $renderer = Symbol('renderer');
const $lastFrame = Symbol('lastFrame');

const BASE_SATURATION = 1; // percent
const BASE_LUMINOSITY = 0.5; // percent
const ATTRACT_LUMINOSITY = 0.4; //percent
const ATTRACT_THRESHOLD = 0.1; // percent
const ANIM_RATE = 0.0003; // Steps per milli. Higher is faster
const FADE_RATE = 5; // Higher is slower
const PROCESSORS = [animations.cycle];

const ATTRACT_MODES = [
  [animations.angledWave(), animations.verticalWave(), animations.horizontalWave()],
  [animations.cycle()]
];

export default class {

  constructor({ width, height, renderer }) {

    this[$renderer] = renderer;
    this[$width] = width;
    this[$height] = height;
    this[$lastFrame] = Date.now();

    const listSize = width * height;
    this[$colours] = makeList(listSize, () => [0, BASE_SATURATION, BASE_LUMINOSITY]);
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

  /**
   * Renders a frame using the current renderer
   */
  render() {

    const percentActive = this[$depths].reduce((depth, percent) => percent + depth / this[$depths].length);
    const attractMode = percentActive < ATTRACT_THRESHOLD;
    const processors = attractMode ? ATTRACT_MODES[0] : PROCESSORS;

    const deltaT = (Date.now() - this[$lastFrame]) * ANIM_RATE; 
    this[$lastFrame] = Date.now();

    // Apply all processors to the depth-map
    const processedDepths = processors.reduce((current, processor) => processor(
      this[$width], 
      this[$height], 
      current, 
      deltaT
    ), this[$depths]);
  
    // Depth only affects hue
    const colours = processedDepths.map(depth => [
      depth / 255,
      BASE_SATURATION,
      attractMode ? ATTRACT_LUMINOSITY : BASE_LUMINOSITY
    ]);

    this[$renderer].render(colours.map(hsl => hslToRgb(...hsl)));
  }
}