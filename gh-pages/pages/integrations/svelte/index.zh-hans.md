# Svelte

我们不提供开箱即用的 Svelte 支持，但你可以在 svelte 中轻松使用原生 JavaScript 版本。

## 依赖安装

```bash
# install with npm
npm install @milkdown/core @milkdown/preset-commonmark @milkdown/theme-nord
```

## 创建一个组件

创建一个组件十分简单。

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
            .use(nord)
            .use(commonmark)
            .create();
    }
</script>

<style></style>

<div use:editor />
```

### 在线示例

!CodeSandBox{milkdown-svelte-setup-5we3g?fontsize=14&hidenavigation=1&theme=dark&view=preview}
