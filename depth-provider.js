const kinect = require('kinect');

const FAKE_DATA = true;
const FOREGROUND = 800;//1700; // millimeters
const SCALING_FACTOR = 16; // Must be a power of two

/**
 * Returns depth data for each pixel formatted as a flat list
 * Order is left -> right, top -> bottom.
 * @param {*} buffer
 */
function getDepthData(buffer) {
  var i, j, depth, minDepth = FOREGROUND, maxDepth = 0;
  const depths = new Uint16Array(Math.ceil(buffer.length / 2));
  for (i = 0, j = 0; i < buffer.length; i += 2, j++) {
    // It's actually a stream of 16 bit integers. Ugh.
    depth = (buffer.readUInt8(i+1) << 8) + buffer.readUInt8(i);
    if (depth > 0 && depth < FOREGROUND) {
      depths[j] = depth;
      if (depth < minDepth) {
        minDepth = depth;
      }
      if (depth > maxDepth) {
        maxDepth = depth;
      }
    }
  }

  return {
    depths: depths,
    minDepth: minDepth,
    maxDepth: maxDepth
  };
}

function fakeData() {
  const NUM_LEDS = 1200;
  const d = [];
  for (let i = 0; i < NUM_LEDS; i++) {
      // d.push(Math.round((i / NUM_LEDS) * 255));
      d.push(0);
  }
  return d;
}

function getNormalizedDepth(depth, min, max) {
  const zeroedMax = max - min;
  const zeroedDepth = depth - min;
  return (zeroedMax - zeroedDepth) / zeroedMax;
}

function getPngStream(includeRgb) {
  // TODO? Do I care?
  throw "unsupported";
}

function getLedFrame(frame) {
  const data = getDepthData(frame.data);
  const ledWidth = frame.width / SCALING_FACTOR;
  const ledHeight = frame.height / SCALING_FACTOR;
  const leds = new Array(ledWidth * ledHeight);

  var i;
  for (i = 0; i < leds.length; i++) {
    leds[i] = Math.round(calculateAverage(data, frame.width, frame.height, i) * 255);
  }

  return leds;
}

function calculateAverage(depthData, frameWidth, frameHeight, ledIndex) {
  const ledWidth = frameWidth / SCALING_FACTOR;
  const ledX = ledIndex % ledWidth;
  const ledY = Math.floor(ledIndex / ledWidth);
  const bufferX = ledX * SCALING_FACTOR;
  const bufferY = ledY * SCALING_FACTOR;
  var x, y, depthIndex, acc = 0, numPixels = 0;
  for (x = bufferX; x < bufferX + SCALING_FACTOR && x < frameWidth; x++) {
    for (y = bufferY; y < bufferY + SCALING_FACTOR && y < frameHeight; y++) {
      depthIndex = x + (y * frameWidth);
      if (depthData.depths[depthIndex] === 0) {
        continue;
      }
      acc += getNormalizedDepth(depthData.depths[depthIndex], depthData.minDepth, depthData.maxDepth);
      numPixels++;
    }
  }

  return numPixels === 0 ? 0 : acc / numPixels;
}

var _latestFrame, _context;
function initKinect() {
  _context = kinect();
  _context.on('depth', function(buf) {
    _context.pause();
    _latestFrame = getLedFrame({
      width: 640,
      height: 480,
      data: buf
    });
  });
  _context.start('depth');
  _context.resume();
}

/*
 * Start Kinect
 */

!FAKE_DATA && initKinect();

/*
 * Exports
 */
exports.getPngStream = getPngStream;
exports.getDepthFrame = function() {
  var ret = FAKE_DATA ? fakeData() : _latestFrame;
  _latestFrame = null;
  _context && _context.resume();
  return ret;
};
