# @milkdown/plugin-math

Math plugin for [milkdown](https://saul-mirone.github.io/milkdown/).
Add support for latex.

# Example Usage

> **You need to include the .css file for katex**.

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

import { math } from '@milkdown/plugin-math';

// Don't forget to import the style of katex!
import 'katex/dist/katex.min.css';

Editor.make().use(nord).use(commonmark).use(math).create();
```

# License

Milkdown is open sourced software licensed under [MIT license](https://github.com/Saul-Mirone/milkdown/blob/main/LICENSE).
