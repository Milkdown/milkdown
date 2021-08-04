# @milkdown/plugin-emoji

Emoji plugin for [milkdown](https://saul-mirone.github.io/milkdown/).
Add support for emoji through [shortcuts](https://www.webfx.com/tools/emoji-cheat-sheet/).
Rendered by [twemoji](https://github.com/twitter/twemoji).

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

// import theme and style
import '@milkdown/theme-nord/lib/theme.css';
import '@milkdown/preset-commonmark/lib/style.css';

import { emoji } from '@milkdown/plugin-emoji';
// import style
import '@milkdown/plugin-emoji/lib/style.css';

new Editor().use(commonmark).use(emoji).create();
```
