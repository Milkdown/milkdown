# @milkdown/plugin-tooltip

Tooltip plugin for [milkdown](https://saul-mirone.github.io/milkdown/).
Add support for tooltip commands.

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

// import theme and style
import '@milkdown/theme-nord/lib/theme.css';
import '@milkdown/preset-commonmark/lib/style.css';

import { tooltip } from '@milkdown/plugin-tooltip';
// import style
import '@milkdown/plugin-tooltip/lib/style.css';

const root = document.body;
new Editor({ root }).use(commonmark).use(tooltip).create();
```
