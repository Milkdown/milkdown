# @milkdown/plugin-history

History undo & redo support for [milkdown](https://saul-mirone.github.io/milkdown/).

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

import { history } from '@milkdown/plugin-history';

// import theme and style
import '@milkdown/theme-nord/lib/theme.css';
import '@milkdown/preset-commonmark/lib/style.css';

const root = document.body;
new Editor({ root }).use(commonmark).use(history).create();
```
