# Integrating Plugins

We provide a method for users to integrate exists plugins of remark and prosemirror.

---

## Remark Plugin

Used to enable remark plugin.

```typescript
import { createPlugin } from '@milkdown/utils';

const remarkPlugin = createPlugin({
    remarkPlugins: () => [someRemarkPlugin, someOtherRemarkPlugin],
});

// use
milkdown.use(remarkPlugin());
```

---

## Prosemirror Plugin

Used to enable prosemirror plugin.

```typescript
import { createPlugin } from '@milkdown/utils';

const prosePlugin = createPlugin({
    prosePlugins: () => [someProsePlugin, someOtherProsePlugin],
});

// use
milkdown.use(prosePlugin());
```
