# NuxtJS

由於我們提供開箱即用的 [vue](/vue) 支持，我們可以直接在 [NuxtJS](https://v3.nuxtjs.org/) 中使用它。

> NuxtJS 版本應該是 3.x。

## 安裝依賴套件

除了`@milkdown/core`、預設和主題。 我們需要安裝 `@milkdown/vue`，它為 milkdown 中的 vue 提供了很多功能。

```bash
# 使用 npm 安裝
npm install @milkdown/vue @milkdown/core @milkdown/prose

npm install @milkdown/preset-commonmark @milkdown/theme-nord
```

## 創建組件

創建一個組件非常容易。

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

### 在線範例

!StackBlitz{milkdown-nuxt}
