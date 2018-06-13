import { strictGet } from './util.js';

/**
 * Adds emitter functionality to an object
 * @param {*} target The object to turn into an emitter
 * @param {Iterable<string>} events Iterable of supported event names
 * 
 * @author mtownsend
 * @since June 2018
 */
export default function(target, events) {  
  const listeners = new Map(events.map(s => [s, new Set()]));

  /**
   * Adds a listener to an event
   * @param {string} eventName The name of the event to add
   * @param {function} listener The listener to add
   */
  target.on = function(eventName, listener) {
    strictGet(listeners, eventName).add(listener);
  }

  /**
   * Removes one (or all) listeners from an event
   * @param {string} eventName The name of the event to remove
   * @param {function} [listener] The specific listener to remove
   */
  target.off = function(eventName, listener) {
    const eventListeners = strictGet(listeners, eventName);
    if (listener) {
      eventListeners.delete(listener);
    }
    else {
      eventListeners.clear();
    }
  }

  /**
   * Emits an event
   * @param {string} eventName The event to emit
   * @param {*[]} args The arguments to pass to listeners
   */
  target.emit = function(eventName, ...args) {
    strictGet(listeners, eventName).forEach(f => f(...args));
  }

  return target;
}