import { wrap, indexToCoords } from '../util.js';

function inputToCoords(width, input) {
  return input.map((z, i) => {
    const coords = indexToCoords(width, i);
    coords.push(z);
    return coords;
  });
}

function waveFactory(amplitudeScale, timeScale, timeOffset, axisProvider) {
  const a = amplitudeScale * 255;
  return () => {
    let t = wrap(timeOffset, 1);
    return (width, height, input, deltaT) => {
      t = wrap(t + (deltaT * timeScale), 1);
      const step = getWaveStep(t);
      return inputToCoords(width, input).map(([x, y, z]) => {
        const pos = axisProvider(x, y, width, height);
        const waveOffset = Math.floor(Math.sin(pos) * step * a);
        return wrap(z + waveOffset, 255);
      });
    }
  };
}

function getWaveStep(t) {
  return Math.sin(t * Math.PI * 2);
}

function mult(provider, multiplier) {
  return (...args) => provider(...args) * multiplier;
}

function offset(provider, offset) {
  return (...args) => provider(...args) + offset;
}

function verticalProvider(x, y, width, height) {
  return (y / height) * Math.PI;
}

function horizontalProvider(x, y, width, height) {
  return (x / width) * Math.PI;
}

function rotationalProvider(rotation) {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  return (x, y, width, height) => {
    const rotatedX = (x * cos) - (y * sin);
    const rotatedY = (x * sin) + (y * cos);
    return horizontalProvider(rotatedX, rotatedY, width, height);
  };
}

export function cycle() {
  let pos = 0;
  return (width, height, input, deltaT) => {
    pos = wrap(pos + deltaT, 1);
    const offset = Math.floor(pos * 255);
    return input.map(i => wrap(i - offset, 255));
  };
}

export function randomWave() {
  const amplitude = (Math.random() * 0.50) + 0.25;
  const speed = (Math.random() * 0.5) + 0.25;
  const timeOffset = Math.random() * 0.75;
  const rotation = Math.random() * Math.PI;
  const translation = Math.random();
  const harmonic = Math.random() * 3;
  return waveFactory(amplitude, speed, timeOffset, mult(offset(rotationalProvider(rotation), translation), harmonic))();
}


