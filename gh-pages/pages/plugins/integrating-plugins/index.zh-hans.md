# 集成插件

我们提供了方法来让用户将已有的 prosemirror 和 remark 插件快速集成到 milkdown 中。

---

## Remark 插件

用于添加 remark 插件。

```typescript
import { createPlugin } from '@milkdown/utils';

const remarkPlugin = createPlugin({
    remarkPlugins: () => [someRemarkPlugin, someOtherRemarkPlugin],
});

// use
milkdown.use(remarkPlugin());
```

---

## Prosemirror 插件

用于添加 prosemirror 插件。

```typescript
import { createPlugin } from '@milkdown/utils';

const prosePlugin = createPlugin({
    prosePlugins: () => [someProsePlugin, someOtherProsePlugin],
});

// use
milkdown.use(prosePlugin());
```
