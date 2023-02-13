# FAQ

This page lists answers of FAQ.

---

### How can I change contents programmatically?

You should use `editor.action` to change the contents.
We provide two macros for change contents in milkdown, `insert` and `replaceAll`.

```typescript
import { insert, replaceAll } from '@milkdown/utils';

const editor = await Editor.make()
  // .use(<All Your Plugins>)
  .create();

editor.action(insert('# New Heading'));

editor.action(replaceAll('# New Document'));
```

---

### How to configure remark?

```typescript
import { remarkStringifyOptionsCtx } from '@milkdown/core';
editor.config(ctx => {
  ctx.set(remarkStringifyOptionsCtx, {
    // some options, for example:
    bullet: '*',
    fences: true,
    incrementListMarker: false,
  });
});
```
