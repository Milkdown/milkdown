# @milkdown/plugin-trailing

The trailing plugin of [milkdown](https://milkdown.dev/).
Append a paragraph when insert a node.
Make it easier to move the cursor out side a mermaid or math node

# Official Documentation

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { trailingNode } from '@milkdown/plugin-trailing';
import { nord } from '@milkdown/theme-nord';

Editor.make().use(nord).use(commonmark).use(trailingNode()).create();
```

# License

Milkdown is open sourced software licensed under [MIT license](https://github.com/Saul-Mirone/milkdown/blob/main/LICENSE).
