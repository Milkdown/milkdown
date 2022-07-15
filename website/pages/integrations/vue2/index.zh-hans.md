# Vue2

我们不提供开箱即用的 Vue2 支持，但你可以在 Vue2 中轻松使用原生 JavaScript 版本。

## 依赖安装

```bash
# install with npm
npm install @milkdown/core @milkdown/preset-commonmark @milkdown/theme-nord
```

## 创建一个组件

创建一个组件十分简单。

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

### 在线示例

!CodeSandBox{milkdown-vue2-setup-t0cg0?fontsize=14&hidenavigation=1&theme=dark&view=preview}
