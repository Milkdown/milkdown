# @milkdown/plugin-listener

Listener plugin for [milkdown](https://saul-mirone.github.io/milkdown/).

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

import { listener, listenerCtx } from '@milkdown/plugin-listener';

Editor.make()
    .config((ctx) => {
        ctx.set(listenerCtx, {
            markdown: [(get) => console.log(get())],
            doc: [console.log],
        });
    })
    .use(nord)
    .use(commonmark)
    .use(listener)
    .create();
```
