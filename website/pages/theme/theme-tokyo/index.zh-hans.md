# @milkdown/theme-tokyo

适用于[Milkdown](https://milkdown.dev/)的[tokyo](https://github.com/enkia/tokyo-night-vscode-theme)主题。

灵感来自[tokyo night theme](https://github.com/enkia/tokyo-night-vscode-theme)。

```typescript
import { Editor } from '@milkdown/core';
import { tokyo } from '@milkdown/theme-tokyo';

import { commonmark } from '@milkdown/preset-commonmark';

Editor.make().use(tokyo).use(commonmark).create();
```

我们使用 material 图标库和 roboto 字体，在使用之前不要忘记导入它们！

举个例子，你可以从 CDN 上面获取他们：

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
