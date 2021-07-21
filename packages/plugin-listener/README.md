# @milkdown/plugin-listener

Listener plugin for [milkdown](https://saul-mirone.github.io/milkdown/).

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

import { listener, listenerCtx } from '@milkdown/plugin-history';

// import theme and style
import '@milkdown/theme-nord/lib/theme.css';
import '@milkdown/preset-commonmark/lib/style.css';

new Editor()
    .config((ctx) => {
        ctx.set(listenerCtx, {
            markdown: [(get) => console.log(get())],
            doc: [console.log],
        });
    })
    .use(commonmark)
    .use(listener)
    .create();
```
