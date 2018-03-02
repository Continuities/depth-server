import LedWall from './ledwall.js';

const WIDTH = 40;
const HEIGHT = 30;

const ledWall = new LedWall({
  width: WIDTH,
  height: HEIGHT,
  parentElement: document.body
});

requestAnimationFrame(function renderFrame() {
  requestAnimationFrame(renderFrame);
  ledWall.render();
});

const depthSocket = new WebSocket(`ws://${window.location.host}`, 'depth');
depthSocket.onmessage = event => {
  const data = JSON.parse(event.data);
  data.forEach((value, index) => {
    ledWall.setDepth(index, value);
  });
};