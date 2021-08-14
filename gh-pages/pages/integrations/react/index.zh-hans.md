# React

我们提供开箱即用的 react 支持。

## 依赖安装

除了 `@milkdown/core`，预设和主题，我们还需要安装 `@milkdown/react`，它提供了许多让 milkdown 运行在 react 中的能力。

```bash
# install with npm
npm install @milkdown/react @milkdown/core

# optional
npm install @milkdown/preset-commonmark @milkdown/theme-nord
```

## 创建一个组件

创建一个组件十分简单。

```typescript
import React from 'react';
import { Editor, rootCtx } from '@milkdown/core';
import { ReactEditor, useEditor } from '@milkdown/react';
import { commonmark } from '@milkdown/preset-commonmark';

import '@milkdown/theme-nord/lib/theme.css';
import '@milkdown/preset-commonmark/lib/style.css';

export const MilkdownEditor: React.FC = () => {
    const editor = useEditor((root) =>
        new Editor()
            .config((ctx) => {
                ctx.set(rootCtx, root);
            })
            .use(commonmark),
    );

    return <ReactEditor editor={editor} />;
};
```

### 在线示例

!CodeSandBox{milkdown-react-setup-ngkiq?fontsize=14&hidenavigation=1&theme=dark&view=preview}

---

## 自定义节点组件 Component

我们提供开箱即用的自定义组件的支持。

```typescript
import React from 'react';
import { Editor, rootCtx } from '@milkdown/core';
import { ReactEditor, useEditor, useNodeCtx } from '@milkdown/react';
import { commonmark, paragraph, image } from '@milkdown/preset-commonmark';

const CustomParagraph: React.FC = ({ children }) => <div className="react-paragraph">{children}</div>;

const CustomImage: React.FC = ({ children }) => {
    const { node } = useNodeCtx();

    return (
        <img
            className="react-image"
            src={node.attrs.src}
            alt={node.attrs.alt}
            title={node.attrs.tittle}
        />;
    )
};

export const MilkdownEditor: React.FC = () => {
    const editor = useEditor((root, renderReact) => {
        const nodes = commonmark
            .configure(paragraph, { view: renderReact(CustomParagraph) })
            .configure(image, { view: renderReact(CustomImage) });

        return new Editor()
            .config((ctx) => {
                ctx.set(rootCtx, root);
            })
            .use(nodes);
    });

    return <ReactEditor editor={editor} />;
};
```

`useNodeCtx`中可以获取到的值：

-   _editor_:

    Milkdown 编辑器的实例。

-   _node_:

    需要当前组件渲染的 prosemirror 节点。
    Current prosemirror node need to be rendered.
    等同于 [nodeViews 中的 node 参数](https://prosemirror.net/docs/ref/#view.EditorProps.nodeViews)。

-   _view_:

    当前编辑器的 prosemirror view。
    等同于 [nodeViews 中的 view 参数](https://prosemirror.net/docs/ref/#view.EditorProps.nodeViews)。

-   _getPos_:

    用于获取当前节点的位置的方法或属性。
    等同于 [nodeViews 中的 getPos 参数](https://prosemirror.net/docs/ref/#view.EditorProps.nodeViews)。

-   _decorations_:

    当前节点的 prosemirror decorations。
    等同于 [nodeViews 中的 decorations 参数](https://prosemirror.net/docs/ref/#view.EditorProps.nodeViews)。
