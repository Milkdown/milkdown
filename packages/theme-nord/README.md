# @milkdown/theme-nord

[Nord theme](https://www.nordtheme.com/) for [milkdown](https://saul-mirone.github.io/milkdown/).

Designed by [Meo](https://github.com/Saul-Meo). Powered by [Theme Nord](https://www.nordtheme.com/) and [Material Design](https://material.io/design).

# Example Usage

```typescript
import { Editor } from '@milkdown/core';

// import theme
import '@milkdown/theme-nord/lib/theme.css';

import { commonmark } from '@milkdown/preset-commonmark';
import '@milkdown/preset-commonmark/lib/style.css';

new Editor().use(commonmark).create();
```
