# @milkdown/preset-commonmark

Common mark preset for [milkdown](https://saul-mirone.github.io/milkdown/).
Add support for commonmark.

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

// import theme
import '@milkdown/theme-nord/lib/theme.css';

const root = document.body;
new Editor({ root }).use(commonmark).create();
```
