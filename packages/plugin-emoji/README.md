# @milkdown/plugin-emoji

Emoji plugin for [milkdown](https://saul-mirone.github.io/milkdown/).
Add support for emoji through [shortcuts](https://www.webfx.com/tools/emoji-cheat-sheet/).
Rendered by [twemoji](https://github.com/twitter/twemoji).

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

import { emoji } from '@milkdown/plugin-emoji';

Editor.make().use(nord).use(commonmark).use(emoji).create();
```

# License

Milkdown is open sourced software licensed under [MIT license](https://github.com/Saul-Mirone/milkdown/blob/main/LICENSE).
