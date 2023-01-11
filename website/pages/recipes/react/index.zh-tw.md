# React

我們提供開箱即用的 react 支援。

## 依賴安裝

除了 `@milkdown/core`、預設和主題，我們還需要安裝 `@milkdown/react`，它提供了讓 milkdown 執行在 react 中的能力。

```bash
# 透過npm安裝
npm install @milkdown/react @milkdown/core

# 可選
npm install @milkdown/preset-commonmark @milkdown/theme-nord
```

## 建立一個組件

建立一個組件十分簡單。

```typescript
import React from 'react';
import { Editor, rootCtx } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';
import { ReactEditor, useEditor } from '@milkdown/react';
import { commonmark } from '@milkdown/preset-commonmark';

export const MilkdownEditor: React.FC = () => {
    const { editor } = useEditor((root) =>
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

### 在線範例

!CodeSandBox{milkdown-react-setup-ngkiq?fontsize=14&hidenavigation=1&theme=dark&view=preview}

---

## 自定義節點組件 Component

我們提供開箱即用的自定義組件的支援。

```typescript
import React from 'react';
import { Editor, rootCtx } from '@milkdown/core';
import { ReactEditor, useEditor, useNodeCtx } from '@milkdown/react';
import { commonmark, paragraph, image } from '@milkdown/preset-commonmark';

const CustomParagraph: React.FC = ({ children }) => <div className="react-paragraph">{children}</div>;

const CustomImage: React.FC = ({ children }) => {
    const { node } = useNodeCtx();

    return <img className="react-image" src={node.attrs.src} alt={node.attrs.alt} title={node.attrs.tittle} />;
};

export const MilkdownEditor: React.FC = () => {
    const editor = useEditor((root, renderReact) => {
        const nodes = commonmark
            .configure(paragraph, { view: renderReact(CustomParagraph) })
            .configure(image, { view: renderReact(CustomImage) });

        return Editor.make()
            .config((ctx) => {
                ctx.set(rootCtx, root);
            })
            .use(nodes);
    });

    return <ReactEditor editor={editor} />;
};
```

`useNodeCtx` 中可以獲取到的值：

-   _ctx_:

    Milkdown 編輯器的 ctx。

-   _node_:

    目前需要組件渲染的 prosemirror 節點。
    等同於 [nodeViews 中的 node 参数](https://prosemirror.net/docs/ref/#view.EditorProps.nodeViews)。

-   _view_:

    目前編輯器的 prosemirror view。
    等同於 [nodeViews 中的 view 参数](https://prosemirror.net/docs/ref/#view.EditorProps.nodeViews)。

-   _getPos_:

    用於獲取目前節點的位置的方法或屬性。
    等同於 [nodeViews 中的 getPos 参数](https://prosemirror.net/docs/ref/#view.EditorProps.nodeViews)。

-   _decorations_:

    目前節點的 prosemirror decorations。
    等同於 [nodeViews 中的 decorations 参数](https://prosemirror.net/docs/ref/#view.EditorProps.nodeViews)。
