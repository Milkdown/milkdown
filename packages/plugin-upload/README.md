# @milkdown/plugin-upload

Upload image when drop for [milkdown](https://saul-mirone.github.io/milkdown/).

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

import { upload } from '@milkdown/plugin-upload';

Editor.make().use(commonmark).use(upload).create();
```
