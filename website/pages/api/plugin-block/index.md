# @milkdown/plugin-block

Block plugin for [milkdown](https://milkdown.dev/) to simulate the behavior of block editor.

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

import { block } from '@milkdown/plugin-block';

Editor.make().use(commonmark).use(block).create();
```

## ConfigBuilder

You can configure the list through `configBuilder` options. You can provide your own configBuilder by:

```typescript
import { block, blockPlugin } from '@milkdown/plugin-block';

Editor.make().use(
    block.configure(blockPlugin, {
        configBuilder: (ctx) => {
            return [
                /* your actions */
            ];
        },
    }),
);
```

You can find the [default config builder here](https://github.com/Saul-Mirone/milkdown/blob/main/packages/plugin-block/src/config.ts).
