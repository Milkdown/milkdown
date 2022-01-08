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
        ctx.get(listenerCtx)
            .beforeMount((ctx) => {
                // before the editor mounts
            })
            .mounted((ctx) => {
                // after the editor mounts
            })
            .updated((ctx, doc, prevDoc) => {
                // when editor state updates
            })
            .markdownUpdated((ctx, markdown, prevMarkdown) => {
                // when markdown updates
            })
            .blur((ctx) => {
                // when editor loses focus
            })
            .focus((ctx) => {
                // when focus editor
            })
            .destroy((ctx) => {
                // when editor is being destroyed
            });
    })
    .use(nord)
    .use(commonmark)
    .use(listener)
    .create();
```

# License

Milkdown is open sourced software licensed under [MIT license](https://github.com/Saul-Mirone/milkdown/blob/main/LICENSE).
