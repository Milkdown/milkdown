# @milkdown/theme-nord

[Nord theme](https://www.nordtheme.com/) for [milkdown](https://saul-mirone.github.io/milkdown/).

Designed by Meo, a talented designer.

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

// import theme
import '@milkdown/theme-nord/lib/theme.css';

const root = document.body;
new Editor({ root }).use(commonmark).create();
```
