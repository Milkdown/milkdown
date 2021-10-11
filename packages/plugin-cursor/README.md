# @milkdown/plugin-cursor

Add [drop cursor](https://github.com/ProseMirror/prosemirror-dropcursor) and [gap Cursor](https://github.com/ProseMirror/prosemirror-gapcursor) for [milkdown](https://saul-mirone.github.io/milkdown/).

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

import { cursor } from '@milkdown/plugin-cursor';

Editor.make().use(nord).use(commonmark).use(cursor).create();
```

# License

Milkdown is open sourced software licensed under [MIT license](https://github.com/Saul-Mirone/milkdown/blob/main/LICENSE).
