import { log, flatten } from '../util.js';

const usb = require('usb');

const VID = 5824;
const PID = 1155;
const LOGGER = log.bind(null, 'usb');
const CLR_SIG = [0x01, 0x00, 0x01];

/* Single-pixel USB packets are super inefficient, but seems
 * to get rid of the glitching. I'm okay with it. */
const CHUNK_SIZE = 1; // Pixels in a USB packet

const $width = Symbol('width');
const $height = Symbol('height');
const $transfer = Symbol('transfer');
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
      if (di.isKernelDriverActive()) {
        di.detachKernelDriver();
      }
      di.claim();

      this[$transfer] = data => 
        new Promise((resolve, reject) => 
          di.endpoints[0].transfer(new Buffer(data), err => err ? reject(err) : resolve()));

      LOGGER('info', 'USB initialized.');
    });
  }

  render(colours) {
    if (!this[$transfer]) {
      LOGGER('error', 'Tried to write to uninitialized USB device!');
      return;
    }

    // Glitching has something to due to 64-byte packet boundaries.
    // Sending in small chunks changes the size of the glitches.
    this[$transfer](CLR_SIG);
    while (colours.length > 0) {
      this[$transfer](flatten(colours.splice(0, CHUNK_SIZE)));
    }
  }
}
