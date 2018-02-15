const $width = Symbol('width');
const $height = Symbol('height');
const $colours = Symbol('colours');
const $parent = Symbol('parent');

export default class {

  constructor({ width, height, parentElement }) {
    this[$width] = width;
    this[$height] = height;
    this[$parent] = parentElement;

    const colours = this[$colours] = new Array(width * height);
    colours.fill([0, 0, 0]);

    this.render();
  }

  setColour(i, r, g, b) {
    this[$colours][i] = [r, g, b];
  }

  render() {
    const container = this[$colours].map(([r, g, b]) => {
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