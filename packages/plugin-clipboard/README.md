# @milkdown/plugin-clipboard

Markdown copy & paste support for [milkdown](https://saul-mirone.github.io/milkdown/).

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

import { clipboard } from '@milkdown/plugin-clipboard';

// import theme and style
import '@milkdown/theme-nord/lib/theme.css';
import '@milkdown/preset-commonmark/lib/style.css';

new Editor().use(commonmark).use(clipboard).create();
```
