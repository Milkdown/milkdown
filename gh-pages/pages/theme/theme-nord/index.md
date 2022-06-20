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

We use material icon and roboto font for this theme, don't forget to import them!

For example, you can get them from CDN:

```html
<!--Roboto-->
<link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap"
/>

<!--Material Icon-->
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" />
```
