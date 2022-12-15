# @milkdown/plugin-history

History undo & redo support for [milkdown](https://milkdown.dev/).

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

import { history } from '@milkdown/plugin-history';

Editor.make().use(nord).use(commonmark).use(history).create();
```
