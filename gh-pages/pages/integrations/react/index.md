# React

We provide react support out of box.

## Install the Dependencies

Except the `@milkdown/core`, preset and theme. We need to install the `@milkdown/react`, which provide lots of abilities for react in milkdown.

```bash
# install with npm
npm install @milkdown/react @milkdown/core @milkdown/prose

npm install @milkdown/preset-commonmark @milkdown/theme-nord
```

## Create a Component

Create a component is pretty easy.

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

### Online Demo

!CodeSandBox{milkdown-react-setup-ngkiq?fontsize=14&hidenavigation=1&theme=dark&view=preview}

---

## Custom Component for Node

We provide support of custom component for node out of box.

```typescript
import React from 'react';
import { Editor, rootCtx } from '@milkdown/core';
import { ReactEditor, useEditor, useNodeCtx } from '@milkdown/react';
import { commonmark, paragraph, image } from '@milkdown/preset-commonmark';

const CustomParagraph: React.FC = ({ children }) => <div className="react-paragraph">{children}</div>;

const CustomImage: React.FC = ({ children }) => {
    const { node } = useNodeCtx();

    return <img className="react-image" src={node.attrs.src} alt={node.attrs.alt} title={node.attrs.title} />;
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

Values can be get by `useNodeCtx`:

-   _ctx_:

    Instance of milkdown ctx.

-   _node_:

    Current prosemirror node need to be rendered.
    Equal to [node parameter in nodeViews](https://prosemirror.net/docs/ref/#view.EditorProps.nodeViews).

-   _view_:

    Current prosemirror editor view.
    Equal to [view parameter in nodeViews](https://prosemirror.net/docs/ref/#view.EditorProps.nodeViews).

-   _getPos_:

    Method or property to get position of current prosemirror node.
    Equal to [getPos parameter in nodeViews](https://prosemirror.net/docs/ref/#view.EditorProps.nodeViews).

-   _decorations_:

    Decorations of current prosemirror node.
    Equal to [decorations parameter in nodeViews](https://prosemirror.net/docs/ref/#view.EditorProps.nodeViews).
