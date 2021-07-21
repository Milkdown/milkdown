# @milkdown/plugin-cursor

Add [drop cursor](https://github.com/ProseMirror/prosemirror-dropcursor) and [gap Cursor](https://github.com/ProseMirror/prosemirror-gapcursor) for [milkdown](https://saul-mirone.github.io/milkdown/).

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

import { cursor } from '@milkdown/plugin-cursor';

// import theme and style
import '@milkdown/theme-nord/lib/theme.css';
import '@milkdown/preset-commonmark/lib/style.css';

import '@milkdown/plugin-cursor/lib/style.css';

new Editor().use(commonmark).use(cursor()).create();
```
