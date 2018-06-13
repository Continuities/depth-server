import { wrap, applyProcessors } from '../util.js';
import emitter from '../emitter.js';

export default function crossfade(fromProcessors, toProcessors) {
  let position = 0;
  const fadingProcessors = emitter([(width, height, input, deltaT) => {
    position += deltaT;
    if (position >= 1) {
      fadingProcessors.emit('complete', toProcessors);
      return applyProcessors(toProcessors, width, height, input, deltaT);
    }

    const fromFrame = applyProcessors(fromProcessors, width, height, input, deltaT);
    const toFrame = applyProcessors(toProcessors, width, height, input, deltaT);

    return fromFrame.map((from, i) => wrap(from * (1 - position) + (toFrame[i] * position), 255));
  }], ['complete']);

  return fadingProcessors;
}