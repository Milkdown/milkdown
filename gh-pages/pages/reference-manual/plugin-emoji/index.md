# @milkdown/plugin-emoji

Add support for emoji through [shortcuts](https://www.webfx.com/tools/emoji-cheat-sheet/).

Rendered by [twemoji](https://github.com/twitter/twemoji).

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

import { emoji } from '@milkdown/plugin-emoji';

Editor.make().use(nord).use(commonmark).use(emoji).create();
```
