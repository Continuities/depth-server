const depth = require('nuimotion/depth');
const Canvas = require('canvas');
const express = require('express');
const app = express();

const FOREGROUND = 1500;
const LIGHTEST = 150;
const DARKEST = 10;

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

/*
 * Start all the shit
 */

depth.init();

app.get('/', function(req, res) {
  const depthFrame = depth.getDepthFrame();
  const rgbFrame = depth.getRGBFrame();

  res.contentType('image/png');
  getCanvasFromFrame(depthFrame, rgbFrame).pngStream().pipe(res);
});

app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});