# Vue2

我們不提供開箱即用的 Vue2 支援，但你可以在 Vue2 中輕鬆使用原生 JavaScript 版本。

## 安裝依賴套件

```bash
# 透過npm安裝
npm install @milkdown/core @milkdown/preset-commonmark @milkdown/theme-nord
```

## 建立一個组件

建立一個组件十分簡單。

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

### 線上範例

!CodeSandBox{milkdown-vue2-setup-t0cg0?fontsize=14&hidenavigation=1&theme=dark&view=preview}
