# @milkdown/plugin-diagram

Add support for diagrams through [mermaid](https://mermaid-js.github.io/mermaid/#/).

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

import { diagram } from '@milkdown/plugin-diagram';

Editor.make().use(nord).use(commonmark).use(diagram).create();
```

In markdown, enter **\`\`\`mermaid** to create a diagram.

Inject a `theme` and `themeCSS` to customize your mermaid instance.
