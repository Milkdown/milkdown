# @milkdown/plugin-prism

Prism plugin for [milkdown](https://saul-mirone.github.io/milkdown/).
Add support for prism highlight.

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

// import theme and style
import '@milkdown/theme-nord/lib/theme.css';
import '@milkdown/preset-commonmark/lib/style.css';

import { prism } from '@milkdown/plugin-prism';
// import style
import '@milkdown/plugin-prism/lib/style.css';

const root = document.body;
new Editor({ root }).use(commonmark).use(prism).create();
```
