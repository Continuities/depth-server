import { wrap, coordsToIndex } from '../util.js';

const DECAY = -16;

function smear(input, output, index, fill) {
  if (input[index] > 0) {
    // There's depth here, so set the fill value
    output[index] = 0;
    return wrap(input[index] - DECAY, 255);
  }
  else if (fill !== null) {
    // There's no depth here, so fill and decay
    output[index] = wrap(output[index] + fill, 255);
  }
  else {
    output[index] = input[index];
  }

  if (output[index] > 0) {
    return wrap(output[index] - DECAY, 255);
  }

  return null;
}

function sumLists(lists) {
  return lists.reduce((sum, list) => {
    list.forEach((val, i) => sum[i] = wrap(sum[i] + val, 255));
    return sum;
  }, Array.from(new Array(lists[0].length), i => 0));
}

// Input should be the depth map, with value [0, 255]
export function aura(width, height, input) {
  const outputs = [new Array(input.length), new Array(input.length)];
  outputs.forEach(o => o.fill(0));

  // Smear right
  for (let y = 0; y < height; y++) {
    let fill = null;
    for (let x = 0; x < width; x++) {
      const index = coordsToIndex(width, x, y);
      fill = smear(input, outputs[0], index, fill);
    }
  }

  // Smear left
  for (let y = 0; y < height; y++) {
    let fill = null;
    for (let x = width - 1; x >= 0; x--) {
      const index = coordsToIndex(width, x, y);
      fill = smear(input, outputs[1], index, fill);
    }
  }

  input = sumLists([...outputs, input]);
  outputs.forEach(o => o.fill(0));

  // Smear down
  for (let x = 0; x < width; x++) {
    let fill = null;
    for (let y = 0; y < height; y++) {
      const index = coordsToIndex(width, x, y);
      fill = smear(input, outputs[0], index, fill);
    }
  }

  // Smear up
  for (let x = 0; x < width; x++) {
    let fill = null;
    for (let y = height - 1; y >= 0; y--) {
      const index = coordsToIndex(width, x, y);
      fill = smear(input, outputs[1], index, fill);
    }
  }

  return sumLists([...outputs, input]);
}