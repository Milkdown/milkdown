# Svelte

我們不提供開箱即用的 Svelte 支援，但你可以在 svelte 中輕鬆使用原生 JavaScript 版本。

## 安裝依賴套件

```bash
# 透過npm安裝
npm install @milkdown/core @milkdown/preset-commonmark @milkdown/theme-nord
```

## 建立一個组件

建立一個组件十分簡單。

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

### 線上範例

!CodeSandBox{milkdown-svelte-setup-5we3g?fontsize=14&hidenavigation=1&theme=dark&view=preview}
