const SYMBOL_COMPUTED = Symbol('computed');

/**
 * Creates a new chain of responsibility proxy where
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

function compute(computation) {
  const fn = function (...args) {
    return computation(...args);
  };

  fn[SYMBOL_COMPUTED] = true;

  return fn;
}

exports.compute = compute;

function get(sources, property) {
  if (Array.isArray(sources)) {
    return first(sources, property);
  }
  return { value: sources[property], next() {}, index: sources.length };
}

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
  return { value: undefined, next() {}, index: sources.length };
}

exports.collect = function (property) {
  return compute(function (data, next, index, sources) {
    return collect(sources, property);
  });
};

function collect(sources, property, fromIndex = 0) {
  const result = [];
  if (fromIndex < sources.length) {
    for (var index = fromIndex; index < sources.length; index++) {
      if (property in sources[index]) {
        result.push(sources[index][property]);
      }
    }
  }
  return result;
}
