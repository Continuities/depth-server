import { makeList } from '../util.js';
import { hslToRgb } from '../colour.js';

const $elements = Symbol('elements');
const $parent = Symbol('parent');
const $width = Symbol('width');
const $height = Symbol('height');

export default class {
  constructor({ width, height, parentElement }) {
    this[$width] = width;
    this[$height] = height;
    this[$parent] = parentElement;

    this[$elements] = makeList(width * height, () => {
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
  }

  render(colours) {
    const els = this[$elements];
    colours.forEach(([r, g, b], i) => {
      els[i].style.backgroundColor = `rgb(${r},${g},${b})`;
    });
  }
}