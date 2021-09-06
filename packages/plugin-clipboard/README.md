# @milkdown/plugin-clipboard

Markdown copy & paste support for [milkdown](https://saul-mirone.github.io/milkdown/).

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

import { clipboard } from '@milkdown/plugin-clipboard';

new Editor().use(commonmark).use(clipboard).create();
```
