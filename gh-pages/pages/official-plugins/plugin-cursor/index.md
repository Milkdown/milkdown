# @milkdown/plugin-cursor

Add [drop cursor](https://github.com/ProseMirror/prosemirror-dropcursor) and [gap cursor](https://github.com/ProseMirror/prosemirror-gapcursor) support.

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

import { cursor } from '@milkdown/plugin-cursor';

Editor.make().use(nord).use(commonmark).use(cursor).create();
```
