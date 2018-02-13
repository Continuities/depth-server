const depth = require('nuimotion/depth');
const Canvas = require('canvas');
const express = require('express');
const app = express();

const FOREGROUND = 1500;

depth.init();

app.get('/', function(req, res) {
  const frame = depth.getDepthFrame();

  res.contentType('image/png');
  getCanvasFromFrame(frame).pngStream().pipe(res);
});

function getCanvasFromFrame(frame) {
  const width = frame.width, height = frame.height;
  const buffer = frame.data;
  const canvas = new Canvas(width, height);
  const context = canvas.getContext('2d');

  var x, y, depth, colour;
  for (var i = 0; i < buffer.length; i+=2) {
    x = Math.floor(i % (width * 2) / 2);
    y = Math.floor(i / (width * 2));

    // It's actually a stream of 16 bit integers, idiot
    depth = (buffer.readUInt8(i+1) << 8) + buffer.readUInt8(i);
    if (depth > 0 && depth < FOREGROUND) {
      colour = distanceToColour(depth);
      context.fillStyle = 'rgba(' + colour + ',' + colour + ',' + colour + ', 1)';
      context.beginPath();
      context.arc(x, y, 1, 0, 2 * Math.PI, true);
      context.fill();
    }
  }

  return canvas;
}

function distanceToColour(distance) {
  return Math.floor(((FOREGROUND - distance) / FOREGROUND) * 255);
}

app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});