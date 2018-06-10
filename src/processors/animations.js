import { wrap, indexToCoords } from './../util.js';

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

export function cycle() {
  let pos = 0;
  return (width, height, input, deltaT) => {
    pos = wrap(pos + deltaT, 1);
    const offset = Math.floor(pos * 255);
    return input.map(i => wrap(i - offset, 255));
  };
}

export const verticalWave = waveFactory(0.5, 0.6, 0, mult(offset(verticalProvider, 1), 1));
export const horizontalWave = waveFactory(1, 1, 0, mult(horizontalProvider, 2));
