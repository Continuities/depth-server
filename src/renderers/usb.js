import { log, flatten } from '../util.js';

const usb = require('usb');

const VID = 5824;
const PID = 1155;
const LOGGER = log.bind(null, 'usb');
const CLR_SIG = [1, 0, 1, 0];

const $width = Symbol('width');
const $height = Symbol('height');
const $output = Symbol('output');

export default class {
  constructor({ width, height }) {
    this[$width] = width;
    this[$height] = height;

    const dev = usb.findByIds(VID, PID);
    dev.open();

    // reset the device and then open the interface
    LOGGER('info', 'Resetting USB device...');
    dev.reset((err) => {
      const di = dev.interface(1);
      di.claim();
      this[$output] = di.endpoints[0];
      LOGGER('info', 'USB initialized.');
    });
  }

  render(colours) {
    if (!this[$output]) {
      LOGGER('error', 'Tried to write to uninitialized USB device!');
      return;
    }
    // Prepend the clear signal
    const data = new Buffer(CLR_SIG.concat(flatten(colours).map(c=>255)));
    this[$output].transfer(data, function() {
      LOGGER('info', `Sent frame`);
    });
  }
}