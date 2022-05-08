# @milkdown/plugin-clipboard

Markdown copy & paste support for [milkdown](https://milkdown.dev/).

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

import { clipboard } from '@milkdown/plugin-clipboard';

Editor.make().use(commonmark).use(clipboard).create();
```
