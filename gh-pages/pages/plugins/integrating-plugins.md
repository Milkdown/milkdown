# Integrating Plugins

We provide some methods for users to integrate exists plugins of remark and prosemirror.

---

## Remark Plugin

Used to enable remark plugin.

```typescript
import { remarkPluginFactory } from '@milkdown/core';

// equal to
// remark.use(someRemarkPlugin);
const remarkPlugin = remarkPluginFactory(someRemarkPlugin);

// multiple
const remarkPlugin = remarkPluginFactory([someRemarkPlugin, someOtherRemarkPlugin]);

// use
milkdown.use(remarkPlugin);
```

---

## Prosemirror Plugin

Used to enable prosemirror plugin.

```typescript
import { prosePluginFactory } from '@milkdown/core';

// equal to
const prosePlugin = prosePluginFactory(someProsemirrorPlugin);

// multiple
const prosePlugin = prosePluginFactory([someProsePlugin, someOtherProsePlugin]);

// use
milkdown.use(prosePlugin);
```
