# @milkdown/theme-tokyo

Tokyo theme for [milkdown](https://milkdown.dev/).
Inspired by [tokyo night theme](https://github.com/enkia/tokyo-night-vscode-theme).

```typescript
import { Editor } from '@milkdown/core';
import { tokyo } from '@milkdown/theme-tokyo';

import { commonmark } from '@milkdown/preset-commonmark';

Editor.make().use(tokyo).use(commonmark).create();
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
