# Building Plugins

We provide some methods for users to build different types of plugins.

---

## MarkdownIt Rule

Used to enable markdown-it plugin.

```typescript
import { createMarkdownItRule } from '@milkdown/core';

// equal to
// markdownIt.enable('table');
const rule = createMarkdownItRule('my-plugin', () => ['table']);

// use
milkdown.use(rule);
```

---

## MarkdownIt Plugin

Used to enable rules for markdown-it.

```typescript
import { createMarkdownItPlugin } from '@milkdown/core';

// equal to
// markdownIt.use(markdownItTablePlugin);
const markdownItPlugin = createMarkdownItPlugin('milkdown-table', () => [someMarkdownItPlugin]);

// use
milkdown.use(markdownItPlugin);
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
