# @milkdown/plugin-math

Math plugin for [milkdown](https://saul-mirone.github.io/milkdown/).
Add support for latex.

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

import { math } from '@milkdown/plugin-math';

Editor.make().use(nord).use(commonmark).use(math).create();
```
