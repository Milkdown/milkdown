# @milkdown/plugin-slash

Slash plugin for [milkdown](https://saul-mirone.github.io/milkdown/).
Add support for slash commands.

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

// import theme
import '@milkdown/theme-nord/lib/theme.css';

import { slash } from '@milkdown/plugin-slash';
// import style
import '@milkdown/plugin-slash/lib/style.css';

const root = document.body;
new Editor({ root }).use(commonmark).use(slash).create();
```
