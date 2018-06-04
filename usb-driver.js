import { log } from './src/util.js';
import LedWall from './src/ledwall.js';
import UsbRenderer from './src/renderers/usb.js';

const usb = require('usb');
const depth = require('./depth-provider');
const STREAM_RATE = 20; // per second
const WIDTH = 40;
const HEIGHT = 30;

const renderer = new UsbRenderer({
  width: WIDTH,
  height: HEIGHT
});

const ledWall = new LedWall({
  width: WIDTH,
  height: HEIGHT,
  renderer
});

(function doFrame() {
  setTimeout(doFrame, 1000 / STREAM_RATE);
  const frame = depth.getDepthFrame();
  if (!frame) { return; }
  frame.forEach((value, index) => {
    ledWall.setDepth(index, value);
  });
  ledWall.render();
})();