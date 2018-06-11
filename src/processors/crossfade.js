import { wrap, applyProcessors } from '../util.js';

export default function crossfade(fromProcessors, toProcessors, onComplete) {
  let position = 0;
  return [(width, height, input, deltaT) => {
    position += deltaT;
    if (position >= 1) {
      onComplete();
      return applyProcessors(toProcessors, width, height, input, deltaT);
    }

    const fromFrame = applyProcessors(fromProcessors, width, height, input, deltaT);
    const toFrame = applyProcessors(toProcessors, width, height, input, deltaT);

    return fromFrame.map((from, i) => wrap(from * (1 - position) + (toFrame[i] * position), 255));
  }];
}