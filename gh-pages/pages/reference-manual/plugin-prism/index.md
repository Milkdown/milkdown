# @milkdown/plugin-prism

Prism plugin for [milkdown](https://milkdown.dev/).
Add support for prism highlight.

> ⚠️ Keep in mind that you need to import prism style on your own.
>
> For example, using [prism-themes](https://www.npmjs.com/package/prism-themes).

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

import { prism } from '@milkdown/plugin-prism';

Editor.make().use(nord).use(commonmark).use(prism).create();
```
