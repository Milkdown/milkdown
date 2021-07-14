# @milkdown/theme-nord

[Nord theme](https://www.nordtheme.com/) for [milkdown](https://saul-mirone.github.io/milkdown/).

Designed by Meo, a talented designer.

# Example Usage

```typescript
import { Editor } from '@milkdown/core';

// import theme
import '@milkdown/theme-nord/lib/theme.css';

import { commonmark } from '@milkdown/preset-commonmark';
import '@milkdown/preset-commonmark/lib/style.css';

const root = document.body;
new Editor({ root }).use(commonmark).create();
```
