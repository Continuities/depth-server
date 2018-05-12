import { log } from './src/util.js';
import LedWall from './src/ledwall.js';
import UsbRenderer from './src/renderers/usb.js';

const depth = require('./depth-provider');
const STREAM_RATE = 30; // per second
const WIDTH = 40;
const HEIGHT = 30;

const ledWall = new LedWall({
  width: WIDTH,
  height: HEIGHT,
  renderer: new UsbRenderer({
    width: WIDTH,
    height: HEIGHT
  })
});

(function doFrame() {
  setTimeout(doFrame, 1000 / STREAM_RATE);
  depth.getDepthFrame().forEach((value, index) => {
    ledWall.setDepth(index, value);
  });
  ledWall.render();
})();