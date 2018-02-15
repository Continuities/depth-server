import LedWall from './ledwall.js';

const WIDTH = 40;
const HEIGHT = 30;

const ledWall = new LedWall({
  width: WIDTH,
  height: HEIGHT,
  parentElement: document.body
});

//const depthSocket = new WebSocket(`ws://${window.location.host}`, 'depth');
const req = new XMLHttpRequest();
req.addEventListener("load", () => {
  const data = JSON.parse(req.responseText);
  data.forEach((value, index) => {
    ledWall.setColour(index, value, value, value);
  });
  ledWall.render();
});
req.open('GET','/ledframe');
req.send();