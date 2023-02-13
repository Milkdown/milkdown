# Vue

We provide vue support out of box.

> Vue version should be 3.x

## Install the Dependencies

Except the `@milkdown/core`, preset and theme. We need to install the `@milkdown/vue`, which provide lots of abilities for vue in milkdown.

```bash
# install with npm
npm install @milkdown/vue @milkdown/core @milkdown/prose

npm install @milkdown/preset-commonmark @milkdown/theme-nord
```

## Create a Component

Create a component is pretty easy.

First, we need to create a `MilkdownProvider` component.

```html
<!-- MilkdownEditor.vue -->
<template>
  <Milkdown />
</template>

<script>
import { defineComponent } from "vue";
import { Editor, rootCtx, defaultValueCtx } from "@milkdown/core";
import { nord } from "@milkdown/theme-nord";
import { Milkdown, useEditor } from "@milkdown/vue";
import { commonmark } from "@milkdown/preset-commonmark";

export default defineComponent({
  name: "Milkdown",
  components: {
    Milkdown,
  },
  setup: () => {
    useEditor((root) =>
      Editor.make()
        .config((ctx) => {
          ctx.set(rootCtx, root);
        })
        .config(nord)
        .use(commonmark)
    );
  },
});
</script>
```

Then, we need to create a `MilkdownEditorWrapper` component.

```html
<!-- MilkdownEditorWrapper.vue -->
<template>
  <MilkdownProvider>
    <MilkdownEditor />
  </MilkdownProvider>
</template>

<script>
import { defineComponent } from "vue";
import { MilkdownProvider } from "@milkdown/vue";

export default defineComponent({
  name: "MilkdownEditorWrapper",
  components: {
    MilkdownProvider,
  },
  setup: () => {},
});
</script>
```

## Online Demo

// TODO: add online demo
