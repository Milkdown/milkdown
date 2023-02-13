# SolidJS

We don't provide SolidJS support out of box, but you can use the vanilla version with it easily.

## Install the Dependencies

```bash
# install with npm
npm install @milkdown/core @milkdown/prose @milkdown/preset-commonmark @milkdown/theme-nord @milkdown/utils
```

## Create a Component

Create a component is pretty easy.

```typescript
import { onCleanup, onMount } from 'solid-js';
import { defaultValueCtx, Editor, rootCtx } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';
import { emoji } from '@milkdown/plugin-emoji';
import { destroy } from '@milkdown/utils';

const Milkdown = () => {
  let ref;
  let editor;
  onMount(async () => {
    editor = await Editor.make()
      .config((ctx) => {
          ctx.set(rootCtx, ref);
          ctx.set(defaultValueCtx, '# Milkdown :heartpulse: Solidjs');
      })
      .config(nord)
      .use(commonmark)
      .use(emoji)
      .create();
  });

  onCleanup(() => {
      editor.action(destroy());
  });

  return <div ref={ref} />;
};
```

## Online Demo

// TODO: add online demo
