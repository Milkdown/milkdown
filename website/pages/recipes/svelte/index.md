# Svelte

We don't provide Svelte support out of box, but you can use the vanilla version with it easily.

## Install the Dependencies

```bash
# install with npm
npm install @milkdown/core @milkdown/prose @milkdown/preset-commonmark @milkdown/theme-nord
```

## Create a Component

Create a component is pretty easy.

```html
<script>
  import { onMount } from 'svelte';
  import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core';
  import { commonmark } from '@milkdown/preset-commonmark';
  import { nord } from '@milkdown/theme-nord';

  export let defaultValue;

  function editor(dom) {
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, dom);
        ctx.set(defaultValueCtx, defaultValue);
      })
      .config(nord)
      .use(commonmark)
      .create();
  }
</script>

<style></style>

<div use:editor />
```

## Online Demo

// TODO: add online demo
