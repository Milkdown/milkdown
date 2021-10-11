# @milkdown/plugin-diagram

Diagram plugin for [milkdown](https://saul-mirone.github.io/milkdown/).
Add support for diagrams through [mermaid](https://mermaid-js.github.io/mermaid/#/).

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

import { diagram } from '@milkdown/plugin-diagram';

Editor.make().use(nord).use(commonmark).use(diagram).create();
```

In markdown, enter **\`\`\`mermaid** to create a diagram.

# License

Milkdown is open sourced software licensed under [MIT license](https://github.com/Saul-Mirone/milkdown/blob/main/LICENSE).
