const test = require('ava');
const { chainOfResponsibility, compute, collect } = require('..');

test('it return existing properties', (t) => {
  const proxy = chainOfResponsibility({ property: 'value' });
  t.is(proxy.property, 'value');
});
test('it implements a chain of responsibility', (t) => {
  const proxy = chainOfResponsibility([{}, { property: 'value' }]);
  t.is(proxy.property, 'value');
});
test('it iterates first to last', (t) => {
  const proxy = chainOfResponsibility([
    { property: 'value' },
    { property: 'otherValue' },
  ]);
  t.is(proxy.property, 'value');
});
test('it allows to declare computed properties', (t) => {
  const proxy = chainOfResponsibility([
    {},
    { property: compute(() => 'value') },
  ]);
  t.is(proxy.property, 'value');
});
test('it allows using the proxy for computing values', (t) => {
  const proxy = chainOfResponsibility([
    { a: 1 },
    {
      b: 3,
      c: compute((data) => data.a + data.b),
    },
  ]);
  t.is(proxy.c, 4);
});
test('it provides a way to grab the next value in the chain to computed properties', (t) => {
  const proxy = chainOfResponsibility([
    {
      property: compute((data, next) => data.base + next().value),
    },
    {
      base: 'hello',
    },
    {
      property: ' world',
    },
  ]);
  t.is(proxy.property, 'hello world');
});
test('it provides a way to grab all the values of a given property', (t) => {
  const proxy = chainOfResponsibility([{ a: collect }, { a: 1 }, { a: 2 }]);
  t.deepEqual(proxy.a, [1, 2]);
});
