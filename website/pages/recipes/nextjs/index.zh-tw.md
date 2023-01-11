# Next.js

因為我們提供了[react](/zh-hans/react)支援，我們可以直接在[Next.js](https://nextjs.org/)使用它。

## 安装依赖

除了`@milkdown/core`，preset 和 theme 之外，我們需要安裝`@milkdown/react`，它提供了 react 在 milkdown 中的很多能力。

```bash
# install with npm
npm install @milkdown/react @milkdown/core @milkdown/prose

npm install @milkdown/preset-commonmark @milkdown/theme-nord
```

## 建立一個元件

建立元件是十分簡單的。

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

### 線上範例

!CodeSandBox{milkdown-nextjs-setup-9d0766?fontsize=14&hidenavigation=1&theme=dark&view=preview}
