# @milkdown/plugin-block

Block plugin for [milkdown](https://milkdown.dev/) to simulate the behavior of block editor.

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

import { block } from '@milkdown/plugin-block';

Editor.make().use(commonmark).use(block).create();
```
