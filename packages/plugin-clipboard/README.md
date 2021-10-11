# @milkdown/plugin-clipboard

Markdown copy & paste support for [milkdown](https://saul-mirone.github.io/milkdown/).

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

import { clipboard } from '@milkdown/plugin-clipboard';

Editor.make().use(commonmark).use(clipboard).create();
```

# License

Milkdown is open sourced software licensed under [MIT license](https://github.com/Saul-Mirone/milkdown/blob/main/LICENSE).
