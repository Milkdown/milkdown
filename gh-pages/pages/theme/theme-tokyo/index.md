# @milkdown/theme-tokyo

Tokyo theme for [milkdown](https://milkdown.dev/).
Inspired by [tokyo night theme](https://github.com/enkia/tokyo-night-vscode-theme).

```typescript
import { Editor } from '@milkdown/core';
import { tokyo } from '@milkdown/theme-tokyo';

import { commonmark } from '@milkdown/preset-commonmark';

Editor.make().use(tokyo).use(commonmark).create();
```
