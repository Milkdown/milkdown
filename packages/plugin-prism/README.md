# @milkdown/plugin-prism

Prism plugin for [milkdown](https://saul-mirone.github.io/milkdown/).
Add support for prism highlight.

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

import { prism } from '@milkdown/plugin-prism';

Editor.make().use(nord).use(commonmark).use(prism).create();
```

# License

Milkdown is open sourced software licensed under [MIT license](https://github.com/Saul-Mirone/milkdown/blob/main/LICENSE).
