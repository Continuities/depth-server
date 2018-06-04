import { log } from './src/util.js';

const depth = require('./depth-provider');
const WebSocketServer = require('websocket').server;
const express = require('express');
const app = express();

const PORT = 3000;
const STREAM_RATE = 20; // per second
const WS_LOGGER = log.bind(null, 'ws');
const SERVER_LOGGER = log.bind(null, 'server');

const connections = [];
var depthStream = null;

function onGetRequest(sendRgb, req, res) {
  res.contentType('image/png');
  depth.getPngStream(sendRgb).pipe(res);
}

function originIsAllowed(origin) {
  return origin.search(/^http(s)?:\/\/localhost(:\d+)?$/) === 0;
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
      const frame = JSON.stringify(depth.getDepthFrame());
      connections.forEach(function(conn) {
        conn.sendUTF(frame);
      });
    }, 1000 / Math.floor(STREAM_RATE));
  }
  WS_LOGGER('info', 'Connection from origin ' + request.origin + ' accepted. ' + connections.length + ' open connections.');
}

/*
 * Start Express
 */

function nocache(req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
}

app.get('/depth.png', nocache, onGetRequest.bind(null, false));
app.get('/rgb.png', nocache, onGetRequest.bind(null, true));
app.get('/ledframe', nocache, function(req, res) {
  res.status(200).json(depth.getDepthFrame());
});

app.use(express.static('www'));
app.use(express.static('src'));

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
