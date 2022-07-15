# Vue2

We don't provide Vue2 support out of box, but you can use the vanilla version with it easily.

## Install the Dependencies

```bash
# install with npm
npm install @milkdown/core @milkdown/prose @milkdown/preset-commonmark @milkdown/theme-nord
```

## Create a Component

Create a component is pretty easy.

```html
<template>
    <div ref="editor"></div>
</template>

<script>
    import { defaultValueCtx, Editor, rootCtx } from '@milkdown/core';
    import { nord } from '@milkdown/theme-nord';
    import { commonmark } from '@milkdown/preset-commonmark';
    export default {
        name: 'Editor',
        props: {
            msg: String,
        },
        mounted() {
            Editor.make()
                .config((ctx) => {
                    ctx.set(rootCtx, this.$refs.editor);
                    ctx.set(defaultValueCtx, this.$props.msg);
                })
                .use(nord)
                .use(commonmark)
                .create();
        },
    };
</script>

<style></style>
```

### Online Demo

!CodeSandBox{milkdown-vue2-setup-t0cg0?fontsize=14&hidenavigation=1&theme=dark&view=preview}
