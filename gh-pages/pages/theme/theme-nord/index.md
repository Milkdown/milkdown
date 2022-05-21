# @milkdown/theme-nord

[Nord theme](https://www.nordtheme.com/) for [milkdown](https://milkdown.dev/).

Designed by [Meo](https://github.com/Saul-Meo).
Powered by [Theme Nord](https://www.nordtheme.com/) and [Material Design](https://material.io/design).

```typescript
import { Editor } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';

import { commonmark } from '@milkdown/preset-commonmark';

Editor.make().use(nord).use(commonmark).create();
```
