# @milkdown/plugin-listener

Listener plugin for milkdown.

## Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

import { listener, listenerCtx } from '@milkdown/plugin-listener';

Editor.make()
    .config((ctx) => {
      const listener = ctx.get(listenerCtx);

      listener.markdownUpdated((ctx, markdown, prevMarkdown) => {
        if (markdown !== prevMarkdown) {
          YourMarkdownUpdater(markdown);
        }
      })

    })
    .use(listener)
    // use other plugins
    .create();
```

## Plugin

@key
@listener

## Listener

@listenerCtx

@ListenerManager
@Subscribers
