# Keyboard Shortcuts

Keyboard shortcuts are provided by default from both presets and plugins.  Depending on your application, you might want to change them.

You can configure shortcuts just like configure their styles:

```typescript
import { blockquoteKeymap, commonmark } from '@milkdown/preset-commonmark';

Editor
  .make()
  .config((ctx) => {
    ctx.set(blockquoteKeymap.key, {
      WrapInBlockquote: 'Mod-Shift-b',
      // or you may want to bind multiple keys:
      WrapInBlockquote: ['Mod-Shift-b', 'Mod-b'],
    })
  })
  .use(commonmark);
```

If there is no supported commands for the behavior you expect, you can write a [prosemirror keymap plugin](https://github.com/ProseMirror/prosemirror-keymap) to do this.
You may need to read the [composable plugins](/composable-plugins) section to learn how to convert a prosemirror plugin into milkdown plugin.
