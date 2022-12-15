# Vue

我们提供开箱即用的 vue 支持。

> Vue version should be 3.x

## 依赖安装

除了 `@milkdown/core`，预设和主题，我们还需要安装 `@milkdown/vue`，它提供了让 milkdown 运行在 vue 中的能力。

```bash
# install with npm
npm install @milkdown/vue @milkdown/core

# optional
npm install @milkdown/preset-commonmark @milkdown/theme-nord
```

## 创建一个组件

创建一个组件十分简单。

```typescript
import { defineComponent } from 'vue';
import { Editor, rootCtx } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';
import { VueEditor, useEditor } from '@milkdown/vue';
import { commonmark } from '@milkdown/preset-commonmark';

export const MilkdownEditor = defineComponent(() => {
    const editor = useEditor((root) =>
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

### 在线示例

!CodeSandBox{milkdown-vue-setup-wjdup?fontsize=14&hidenavigation=1&theme=dark&view=preview}

---

## 自定义节点组件 Component

我们提供开箱即用的自定义组件的支持。

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
        return Editor.make()
            .config((ctx) => {
                ctx.set(rootCtx, root);
            })
            .use(nodes);
    });

    return () => <VueEditor editor={editor} />;
});
```

自定义组件中被注入的值：

-   _ctx_:

    Milkdown 编辑器的 ctx。

-   _node_:

    当前需要组件渲染的 prosemirror 节点。
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
