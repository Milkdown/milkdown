# NuxtJS

Since we provide [vue](/vue) support out of box, we can use it directly in [NuxtJS](https://v3.nuxtjs.org/).

> NuxtJS version should be 3.x.

## Install the Dependencies

Except the `@milkdown/core`, preset and theme. We need to install the `@milkdown/vue`, which provide lots of abilities for vue in milkdown.

```bash
# install with npm
npm install @milkdown/vue @milkdown/core @milkdown/prose

npm install @milkdown/preset-commonmark @milkdown/theme-nord
```

## Create a Component

Create a component is pretty easy.

```typescript
import { defineComponent } from 'vue';
import { Editor, rootCtx } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';
import { VueEditor, useEditor } from '@milkdown/vue';
import { commonmark } from '@milkdown/preset-commonmark';

export const MilkdownEditor = defineComponent(() => {
    const { editor } = useEditor((root) =>
        Editor.make()
            .config((ctx) => {
                ctx.set(rootCtx, root);
            })
            .use(nord)
            .use(commonmark),
    );

    return () => <VueEditor editor={editor} />;
});
```

### Online Demo

!StackBlitz{milkdown-nuxt}
