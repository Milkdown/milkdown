# Next.js

因为我们提供了[react](/zh-hans/react)支持，我们可以直接在[Next.js](https://nextjs.org/)使用它。

## 安装依赖

除了`@milkdown/core`，preset 和 theme 之外，我们需要安装`@milkdown/react`，它提供了 react 在 milkdown 中的很多能力。

```bash
# install with npm
npm install @milkdown/react @milkdown/core @milkdown/prose

npm install @milkdown/preset-commonmark @milkdown/theme-nord
```

## 创建一个组件

创建组件是十分简单的。

```typescript
import React from 'react';
import { Editor, rootCtx } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';
import { ReactEditor, useEditor } from '@milkdown/react';
import { commonmark } from '@milkdown/preset-commonmark';

export const MilkdownEditor: React.FC = () => {
    const editor = useEditor((root) =>
        Editor.make()
            .config((ctx) => {
                ctx.set(rootCtx, root);
            })
            .use(nord)
            .use(commonmark),
    );

    return <ReactEditor editor={editor} />;
};
```

### 在线示例

!CodeSandBox{milkdown-nextjs-setup-9d0766?fontsize=14&hidenavigation=1&theme=dark&view=preview}
