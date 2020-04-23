/**
 * @module data-proxy
 */

const SYMBOL_COMPUTED = Symbol('computed');

/**
 * Creates a new chain of responsibility proxy
 * that'll look up the properties successivly
 * in each of the given `sources`
 * @param {Array|Object} sources - An object or list of object in which to look for the properties
 * @return {any}
 */
exports.chainOfResponsibility = function chainOfResponsibility(sources) {
  const proxy = new Proxy(sources, {
    get: withComputed(get),
  });
  return proxy;

  function withComputed(getter) {
    return function (sources, property) {
      const { value, next, index } = getter(sources, property);
      if (value && value[SYMBOL_COMPUTED]) {
        return value(proxy, next, index, sources);
      }
      return value;
    };
  }
};

/**
 * @callback computationCallback
 * @param {Object} data - The proxy, allowing to access more properties
 * @param {Function} next - A function allowing to get the next value within the sources of the proxy
 * @param {number} index - The index at which the value was found
 * @param {Array|Object} - The sources inside the proxy
 */

/**
 * Marks given `computation` function to be
 * used for computing the value of a property
 * instead of simply being returned
 * @param {computationCallback} computation
 */
function compute(computation) {
  const fn = function (...args) {
    return computation(...args);
  };

  fn[SYMBOL_COMPUTED] = true;

  return fn;
}

exports.compute = compute;

/**
 * @typedef GetReturn
 * @property {any} value - The value
 * @property {Function} next - A function for getting the next value
 * @property {number} index - The index in the list of source where the value was found
 */

/**
 * Looks up the value of given `property` in
 * the given `sources`
 * @param {Array|Sources} sources
 * @param {String|Symbol} property
 * @return
 */
function get(sources, property) {
  if (Array.isArray(sources)) {
    return first(sources, property);
  }
  return { value: sources[property], next() {}, index: 0 };
}

/**
 * Finds the first value for given `property` inside
 * the given list of `sources` starting at `startIndex`
 * @param {Array} sources
 * @param {String|Symbol} property
 * @param {number} startIndex
 */
function first(sources, property, startIndex = 0) {
  if (startIndex < sources.length) {
    for (var index = startIndex; index < sources.length; index++) {
      if (property in sources[index]) {
        return {
          value: sources[index][property],
          next: function () {
            return first(sources, property, (startIndex = index + 1));
          },
          index: index,
        };
      }
    }
  }
  return { value: undefined, next() {}, index: -1 };
}

/**
 * Creates a function for use as a computed property
 * to collect all the values for given `property`
 * @param {string|Object} property
 * @return {Array}
 */
exports.collect = function (property) {
  return compute(function (data, next, index, sources) {
    return collect(sources, property);
  });
};

/**
 * Collects the values of given `property` within the objects
 * inside `sources`
 * @param {Array} sources
 * @param {string|Object} property
 * @param {number} [startIndex]
 * @return {Array}
 */
function collect(sources, property, startIndex = 0) {
  const result = [];
  if (startIndex < sources.length) {
    for (var index = startIndex; index < sources.length; index++) {
      if (property in sources[index]) {
        result.push(sources[index][property]);
      }
    }
  }
  return result;
}
