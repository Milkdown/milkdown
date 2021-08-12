# 集成插件

我们提供了一些方法来让用户将已有的 prosemirror 和 remark 插件快速集成到 milkdown 中。

---

## Remark 插件

用于添加 remark 插件。

```typescript
import { remarkPluginFactory } from '@milkdown/core';

// 等同于
// remark.use(someRemarkPlugin);
const remarkPlugin = remarkPluginFactory(someRemarkPlugin);

// 多个
const remarkPlugin = remarkPluginFactory([someRemarkPlugin, someOtherRemarkPlugin]);

// 使用
milkdown.use(remarkPlugin);
```

---

## Prosemirror 插件

用于添加 prosemirror 插件。

```typescript
import { prosePluginFactory } from '@milkdown/core';

// 等同于
const prosePlugin = prosePluginFactory(someProsemirrorPlugin);

// 多个
const prosePlugin = prosePluginFactory([someProsePlugin, someOtherProsePlugin]);

// 使用
milkdown.use(prosePlugin);
```
