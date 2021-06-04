# @milkdown/plugin-math

Math plugin for [milkdown](https://saul-mirone.github.io/milkdown/).
Add support for latex.

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

// import theme
import '@milkdown/theme-nord/lib/theme.css';

import { math } from '@milkdown/plugin-math';
// import style
import '@milkdown/plugin-math/lib/style.css';

const root = document.body;
new Editor({ root }).use(commonmark).use(math).create();
```
