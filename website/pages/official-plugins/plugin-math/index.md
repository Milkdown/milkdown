# @milkdown/plugin-math

Math plugin for [milkdown](https://milkdown.dev/).
Add support for latex.

> **You need to include the katex.css file on your own**.

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

import { math } from '@milkdown/plugin-math';

// Don't forget to import the style of katex!
import 'katex/dist/katex.min.css';

Editor.make().use(nord).use(commonmark).use(math).create();
```
