# @milkdown/plugin-slash

Slash plugin for [milkdown](https://saul-mirone.github.io/milkdown/).
Add support for slash commands.

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

import { slash } from '@milkdown/plugin-slash';

Editor.make().use(nord).use(commonmark).use(slash).create();
```
