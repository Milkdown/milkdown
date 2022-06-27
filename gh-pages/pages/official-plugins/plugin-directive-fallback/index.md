# @milkdown/plugin-directive-fallback

let's say if you make a plugin like this.

```typescript

schema: () => ({
    // ...
    parseMarkdown: {
        match: (node) => node.type === 'textDirective' && node.name === 'iframe',
        runner: (state, node, type) => {
            state.addNode(type, { src: (node.attributes as { src: string }).src });
        },
    },
}),

```

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

import { directiveWithFallback } from '@milkdown/plugin-directive-fallback';

const defaultValue = `# Hello milkdown :::abc{.class#id} content ::: `;

Editor.make()
    .Editor.make()
    .use(commonmark)
    .use(iframePlugin)
    .config((ctx) => {
        ctx.set(defaultValueCtx, defaultValue);
    })
    .create();
```

If you don't use plugin-directive-fallback.

The editor crash when you run it with some other directive;

It render all directive as text to avoid parse error when use remark-directive;

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

import { directiveWithFallback } from '@milkdown/plugin-directive-fallback';

const defaultValue = `# Hello milkdown :::abc{.class#id} content ::: `;

Editor.make()
    .Editor.make()
    .use(commonmark)
    .use(iframePlugin)
    .use(directiveWithFallback)
    .config((ctx) => {
        ctx.set(defaultValueCtx, defaultValue);
    })
    .create();
```
