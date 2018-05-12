const depth = require('nuimotion/depth');
const Canvas = require('canvas');

const FAKE_DATA = true;
const STREAM_RATE = 30; // per second
const FOREGROUND = 1700; // millimeters
const LIGHTEST = 150; // 0-255
const DARKEST = 10; // 0-255
const SCALING_FACTOR = 16; // Must be a power of two

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
  var i;
  for (i = 0; i < NUM_LEDS; i++) {
      d.push(Math.round((i / NUM_LEDS) * 255));
  }
  return d;
}

function getCanvasFromFrame(frame, rgbFrame) {
  const width = frame.width, height = frame.height;
  const canvas = new Canvas(rgbFrame ? width * 2 : width, height);
  const context = canvas.getContext('2d');
  const data = getDepthData(frame.data);
  var i, x, y, depth, colour;

  // Draw the depth frame
  for (i = 0; i < data.depths.length; i += 2) {
    x = i % width;
    y = Math.floor(i / width);
    depth = data.depths[i];
    if (depth > 0) {
      colour = getColour(getNormalizedDepth(depth, data.minDepth, data.maxDepth));
      context.fillStyle = 'rgba(' + colour + ',' + colour + ',' + colour + ', 1)';
      context.beginPath();
      context.arc(x, y, 1, 0, 2 * Math.PI, true);
      context.fill();
    }
  }

  // Draw the RGB frame, if it's there
  if (rgbFrame) {
    for (i = 0; i < rgbFrame.data.length - 2; i += 3) {
      x = ((i / 3) % width) + width;
      y = Math.floor((i / 3) / width);
      context.fillStyle = 'rgba(' +
          rgbFrame.data.readUInt8(i) + ',' +
          rgbFrame.data.readUInt8(i + 1) + ',' +
          rgbFrame.data.readUInt8(i + 2) + ', 1)';
      context.beginPath();
      context.arc(x, y, 1, 0, 2 * Math.PI, true);
      context.fill();
    }
  }

  return canvas;
}

function getColour(normalizedDepth) {
  return DARKEST + Math.floor(normalizedDepth * (LIGHTEST - DARKEST));
}

function getNormalizedDepth(depth, min, max) {
  const zeroedMax = max - min;
  const zeroedDepth = depth - min;
  return (zeroedMax - zeroedDepth) / zeroedMax;
}

function getPngStream(includeRgb) {
  const depthFrame = depth.getDepthFrame();
  const rgbFrame = sendRgb ? depth.getRGBFrame() : null;
  return getCanvasFromFrame(depthFrame, rgbFrame).pngStream();
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

/*
 * Start nuimotion
 */

!FAKE_DATA && depth.init();

/*
 * Exports
 */
exports.getPngStream = getPngStream;
exports.getDepthFrame = function() {
  return FAKE_DATA ? fakeData() : getLedFrame(depth.getDepthFrame());
};
