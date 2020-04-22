const SYMBOL_COMPUTED = Symbol('computed');
const SYMBOL_COLLECT = Symbol('collect');

exports.chainOfResponsibility = function chainOfResponsibility(sources) {
  const proxy = new Proxy(sources, {
    get: withComputed(withCollect(get)),
  });
  return proxy;

  function withComputed(getter) {
    return function (sources, property) {
      const { value, next } = getter(sources, property);
      if (value && value[SYMBOL_COMPUTED]) {
        return value(proxy, next);
      }
      return value;
    };
  }
};

function withCollect(getter) {
  return function (sources, property) {
    const result = getter(sources, property);
    if (result.value === SYMBOL_COLLECT) {
      return collect(sources, property, result.index + 1);
    }
    return result;
  };
}

exports.collect = SYMBOL_COLLECT;

exports.compute = function compute(computation) {
  const fn = function (...args) {
    return computation(...args);
  };

  fn[SYMBOL_COMPUTED] = true;

  return fn;
};

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

function collect(sources, property, fromIndex = 0) {
  const result = [];
  if (fromIndex < sources.length) {
    for (var index = fromIndex; index < sources.length; index++) {
      if (property in sources[index]) {
        result.push(sources[index][property]);
      }
    }
  }
  return { value: result, next: () => {}, index: sources.length };
}
