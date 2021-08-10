# Vue

We provide vue support out of box.

> Vue version should be 3.x

## Install the Dependencies

Except the `@milkdown/core`, preset and theme.
We need to install the `@milkdown/vue`,
which provide lots of abilities for vue in milkdown.

```bash
# install with npm
npm install @milkdown/vue @milkdown/core

# optional
npm install @milkdown/preset-commonmark @milkdown/theme-nord
```

## Create a Component

Create a component is pretty easy.

```typescript
import { defineComponent } from 'vue';
import { Editor, rootCtx } from '@milkdown/core';
import { VueEditor, useEditor } from '@milkdown/vue';
import { commonmark } from '@milkdown/preset-commonmark';

import '@milkdown/theme-nord/lib/theme.css';
import '@milkdown/preset-commonmark/lib/style.css';

export const MilkdownEditor = defineComponent(() => {
    const editor = useEditor((root) =>
        new Editor()
            .config((ctx) => {
                ctx.set(rootCtx, root);
            })
            .use(commonmark),
    );

    return () => <VueEditor editor={editor} />;
});
```

## Custom Component for Node

We provide custom node support out of box.

```typescript
import { inject, defineComponent, DefineComponent } from 'vue';
import { Editor, rootCtx } from '@milkdown/core';
import { VueEditor, useEditor } from '@milkdown/vue';
import { commonmark, paragraph, image } from '@milkdown/preset-commonmark';
import { Node } from 'prosemirror-model';

const CustomParagraph: DefineComponent = defineComponent({
    name: 'my-paragraph',
    setup(_, { slots }) {
        return () => <div class="vue-paragraph">{slots.default?.()}</div>;
    },
});

const CustomImage: DefineComponent = defineComponent({
    name: 'my-image',
    setup() {
        const node: Node = inject('node', {} as Node);

        return () => <img class="vue-image" src={node.attrs.src} alt={node.attrs.alt} />;
    },
});

export const MyEditor = defineComponent(() => {
    const editor = useEditor((root, renderVue) => {
        const nodes = commonmark
            .configure(paragraph, {
                view: renderVue(CustomParagraph),
            })
            .configure(image, {
                view: renderVue(CustomImage),
            });
        return new Editor()
            .config((ctx) => {
                ctx.set(rootCtx, root);
            })
            .use(nodes);
    });

    return () => <VueEditor editor={editor} />;
});
```

Values can be inject in custom component:

-   _editor_:

    Instance of current milkdown editor.

-   _node_:

    Current prosemirror node need to be rendered.
    Equal to [node parameter in nodeViews](https://prosemirror.net/docs/ref/#view.EditorProps.nodeViews).

-   _view_:

    Current prosemirror editor view.
    Equal to [view parameter in nodeViews](https://prosemirror.net/docs/ref/#view.EditorProps.nodeViews).

-   _getPos_:

    Method to get position of current prosemirror node.
    Equal to [getPos parameter in nodeViews](https://prosemirror.net/docs/ref/#view.EditorProps.nodeViews).

-   _decorations_:

    Decorations of current prosemirror node.
    Equal to [decorations parameter in nodeViews](https://prosemirror.net/docs/ref/#view.EditorProps.nodeViews).
