import LedWall from './src/ledwall.js';
import UsbRenderer from './src/renderers/usb.js';

const depth = require('./depth-provider');
const STREAM_RATE = 60; // per second
const SAMPLE_RATE = 30; // per second
const PASSIVE_SAMPLE_RATE = 2; // per second
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

let _lastSample = Date.now();
(function doFrame() {
  setTimeout(doFrame, 1000 / STREAM_RATE);

  const sampleRate = ledWall.isInteractive() ? SAMPLE_RATE : PASSIVE_SAMPLE_RATE;
  if (Date.now() - _lastSample >= 1000 / sampleRate) {
    _lastSample = Date.now();
    const frame = depth.getDepthFrame();
    frame && frame.forEach((value, index) => 
        ledWall.setDepth(index, value));
  }

  ledWall.render();
})();