# @milkdown/plugin-trailing

Add a trailing node at the end of the document automatically.

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

import { trailing } from '@milkdown/plugin-trailing';

Editor.make().use(commonmark).use(trailing).create();
```

## Configure Trailing Node

You can add other node type instead of `paragraph` type.

```typescript
import { trailing, trailingPlugin } from '@milkdown/plugin-trailing';

trailing.configure(trailingPlugin, {
    nodeType: (state) => state.schema.nodes.heading.create({ level: 1 }),
});
```

## Configure Wether to Add Trailing Node

By default we'll add trailing node if the last node is not paragraph or heading.

You can configure the behavior to allow other node types as last node.

```typescript
import { trailing, trailingPlugin } from '@milkdown/plugin-trailing';

trailing.configure(trailingPlugin, {
    shouldAppend: (lastNode, state) => lastNode && !['paragraph'].includes(lastNode.type.name),
});
```
