# SolidJS

我們不提供開箱即用的 SolidJS 支援，但你可以在 SolidJS 中輕鬆使用原生 JavaScript 版本。

## 安裝依賴套件

```bash
# 透過npm安裝
npm install @milkdown/core @milkdown/prose @milkdown/preset-commonmark @milkdown/theme-nord @milkdown/utils
```

## 建立一個组件

建立一個组件十分簡單。

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
            .use(commonmark)
            .use(emoji)
            .use(nord)
            .create();
    });

    onCleanup(() => {
        editor.action(destroy());
    });

    return <div ref={ref} />;
};
```

### 線上範例

!CodeSandBox{milkdown-solidjs-setup-7tz6qf?fontsize=14&hidenavigation=1&theme=dark&view=preview}
