data-proxy
===

An experiment to create a proxy over one or many Object that:

- reads the property from the first object with it
- allow computed properties.

Usage
---

```js
const {chainOfResponisibility, compute} = require('@rhumaric/data-proxy');

const proxy = chainOfResponsibility([
  {
    fileName: 'an/article--fr.md'
  },
  {
    defaultLocale: 'en',
    supportedLocales: compute(data => [data.defaultLocale, 'fr']),
    locale: compute(data => getLocale(data.fileName)),
  }
])
```

Possible future implementation
---

- [ ] Implement `has` handler
- [ ] Implement `set` handler (on first object with property, or on injected new object first of the list)
- [ ] Try out some memoisation?
- [ ] See if the concept could be genericised into some proxy builder
