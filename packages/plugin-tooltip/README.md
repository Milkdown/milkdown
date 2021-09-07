# @milkdown/plugin-tooltip

Tooltip plugin for [milkdown](https://saul-mirone.github.io/milkdown/).
Add support for tooltip commands.

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

import { tooltip } from '@milkdown/plugin-tooltip';

Editor.make().use(nord).use(commonmark).use(tooltip).create();
```
