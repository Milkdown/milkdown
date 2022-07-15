# SolidJS

我们不提供开箱即用的 SolidJS 支持，但你可以在 SolidJS 中轻松使用原生 JavaScript 版本。

## 依赖安装

```bash
# install with npm
npm install @milkdown/core @milkdown/prose @milkdown/preset-commonmark @milkdown/theme-nord @milkdown/utils
```

## 创建一个组件

创建一个组件十分简单。

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

### 在线示例

!CodeSandBox{milkdown-solidjs-setup-7tz6qf?fontsize=14&hidenavigation=1&theme=dark&view=preview}
