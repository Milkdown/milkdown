# Building Plugins

We provide some methods for users to build different types of plugins.

---

## Remark Plugin

Used to enable remark plugin.

```typescript
import { createRemarkPlugin } from '@milkdown/core';

// equal to
// remark.use(someRemarkPlugin);
const remarkPlugin = createRemarkPlugin('milkdown-some-remark-plugin', () => [someMarkdownItPlugin]);

// use
milkdown.use(remarkPlugin);
```

---

## Prosemirror Plugin

Used to enable prosemirror plugin.

```typescript
import { createProsemirrorPlugin } from '@milkdown/core';

// equal to
// markdownIt.use(markdownItTablePlugin);
const prosemirrorPlugin = createProsemirrorPlugin('my-plugin', () => [someProsemirrorPlugin]);

// use
milkdown.use(prosemirrorPlugin);
```
