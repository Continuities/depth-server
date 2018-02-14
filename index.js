const depth = require('nuimotion/depth');
const Canvas = require('canvas');
const WebSocketServer = require('websocket').server;
const express = require('express');
const app = express();

const PORT = 3000;
const STREAM_RATE = 3; // per second
const FOREGROUND = 1500; // millimeters
const LIGHTEST = 150; // 0-255
const DARKEST = 10; // 0-255
const WS_LOGGER = log.bind(null, 'ws');
const SERVER_LOGGER = log.bind(null, 'server');

const connections = [];
var depthStream = null;

function formatDate(date) {
  return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
}

function log(namespace, category, message) {
  console[category]('[' + formatDate(new Date()) + '] [' + namespace.toUpperCase() + '] ' + message);
}

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

function onGetRequest(sendRgb, req, res) {
  const depthFrame = depth.getDepthFrame();
  const rgbFrame = sendRgb ? depth.getRGBFrame() : null;

  res.contentType('image/png');
  getCanvasFromFrame(depthFrame, rgbFrame).pngStream().pipe(res);
}

function originIsAllowed(origin) {
  return origin.search(/^http(s)?:\/\/localhost(:\d+)?$/) === 0;
}

function serializeFrame(frame) {
  var i, pixels = [], depth;
  for (i = 0; i < frame.depths.length; i++) {
    depth = frame.depths[i];
    if (depth === 0) {
      continue;
    }
    pixels.push(i + ':' + getColour(getNormalizedDepth(depth, frame.minDepth, frame.maxDepth)));
  }
  return pixels.join(',');
}

function onWebsocketRequest(request) {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject();
    WS_LOGGER('info', 'Connection from origin ' + request.origin + ' rejected.');
    return;
  }

  const connection = request.accept('depth', request.origin);
  connection.on('close', function(reasonCode, description) {
    connections.splice(connections.indexOf(connection), 1);
    if (connections.length === 0) {
      // Shut down the depth stream
      clearInterval(depthStream);
      depthStream = null;
    }
    WS_LOGGER('info', 'Peer ' + connection.remoteAddress + ' disconnected. ' + connections.length + ' open connections.');
  });
  connections.push(connection);

  if (!depthStream) {
    // Start up the depth stream
    depthStream = setInterval(function() {
      const frame = getDepthData(depth.getDepthFrame().data);
      connections.forEach(function(conn) {
        conn.sendUTF(serializeFrame(frame));
      });
    }, 1000 / Math.floor(STREAM_RATE));
  }
  WS_LOGGER('info', 'Connection from origin ' + request.origin + ' accepted. ' + connections.length + ' open connections.');
}

/*
 * Start nuimotion
 */

depth.init();

/*
 * Start Express
 */

app.get('/depth.png', onGetRequest.bind(null, false));
app.get('/rgb.png', onGetRequest.bind(null, true));
app.use(express.static('www'));

const server = app.listen(PORT, function() {
  SERVER_LOGGER('info', 'Listening on port ' + PORT);
});

/*
 * Start the websocket server
 */

const wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});

wsServer.on('request', onWebsocketRequest);
