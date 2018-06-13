/**
 * Ensures a value is between 0 and max, wrapping at the boundaries
 * @param {number} input The value to wrap
 * @param {number} max The maximum allowable value
 * @returns {number} The wrapped value
 */
export function wrap(input, max) {
  if (input > max) {
    return input % max;
  }
  if (input < 0) {
    return input + max;
  }
  return input;
}

/**
 * Converts flat array index into coordinates in the viewport
 * @param {number} width The width of the viewport
 * @param {number} index The index in the array
 * @returns {numbe[]} [x,y] coordinates in the viewport
 */
export function indexToCoords(width, index) {
  return [index % width, Math.floor(index / width)];
}

/**
 * Converts coordinates in the viewport to flat array index
 * @param {number} width The width of the viewport
 * @param {number} x X coordinate in the viewport
 * @param {number} y Y coordinate in the viewport
 */
export function coordsToIndex(width, x, y) {
  return x + (width * y);
}

/**
 * Provider function to fill an empty array
 * @callback fillFunction
 * @param {number} index The index in the array
 * @returns {*} The value for the array index
 */

/**
 * Creates a filled list
 * @param {number} length The length of the list
 * @param {fillFunction} fillFunc The fill function for the list
 * @returns {*[]} A filled list
 */
export function makeList(length, fillFunc) {
  const list = new Array(length);
  for (let i = 0; i < length; i++) {
    list[i] = fillFunc(i);
  }
  return list;
}

/**
 * Formats a date for logging
 * @param {Date} date Date object to format
 * @returns {string} Formatted date
 */
function formatDate(date) {
  return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
}

/**
 * Logs a formatted string to the console
 * @param {string} namespace The logging namespace
 * @param {string} category The category of the log message 
 * @param {string} message The message to log
 */
export function log(namespace, category, message) {
  console[category]('[' + formatDate(new Date()) + '] [' + namespace.toUpperCase() + '] ' + message);
}

/**
 * Flattens a 2d list into a 1d list of the same elements
 * @param {any[][]} listOfLists A two-dimensional list
 * @returns {any[]} A one-dimensional list
 */
export function flatten(listOfLists) {
  return listOfLists.reduce((ret, l) => ret.concat(l));
}

/**
 * Applies a series of processors to depth input
 * @param {function[]} processors Processors to apply
 * @param {number} width Width of the viewport
 * @param {number} height Height of the viewport
 * @param {number[]} input Input depths
 * @param {number} deltaT Time elapsed since last frame
 * @returns {number[]} Processed depths
 */
export function applyProcessors(processors, width, height, input, deltaT) {
  return processors.reduce((current, processor) => processor(
    width, 
    height, 
    current, 
    deltaT
  ), input);
}

/**
 * Gets an item from a Map, throwing if it's not there
 * @param {Map<*>} map The Map to get from
 * @param {*} key The key of the item to get
 */
export function strictGet(map, key) {
  if (!map.has(key)) {
    throw `No key ${key} in map ${map}`;
  }
  return map.get(key);
}