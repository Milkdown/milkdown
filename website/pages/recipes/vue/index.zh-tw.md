# Vue

我們提供開箱即用的 vue 支援。

> Vue 版本應該為 3.x

## 安裝依賴套套件

除了 `@milkdown/core`，預設和主題，我們還需要安裝 `@milkdown/vue`，它提供了讓 milkdown 執行在 vue 中的能力。

```bash
# 透過npm安裝
npm install @milkdown/vue @milkdown/core

# 可選
npm install @milkdown/preset-commonmark @milkdown/theme-nord
```

## 建立一個组件

建立一個组件十分簡單。

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

### 線上範例

!CodeSandBox{milkdown-vue-setup-wjdup?fontsize=14&hidenavigation=1&theme=dark&view=preview}

---

## 自定義節點組件 Component

我們提供開箱即用的自定義組件的支援。

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

自定義組件中被注入的值：

-   _ctx_:

    Milkdown 編輯器的 ctx。

-   _node_:

    目前需要元件渲染的 prosemirror 節點。
    等同於 [nodeViews 中的 node 參數](https://prosemirror.net/docs/ref/#view.EditorProps.nodeViews)。

-   _view_:

    目前編輯器的 prosemirror view。
    等同于 [nodeViews 中的 view 参数](https://prosemirror.net/docs/ref/#view.EditorProps.nodeViews)。

-   _getPos_:

    用於獲取目前節點的位置的方法或屬性。
    等同於 [nodeViews 中的 getPos 參數](https://prosemirror.net/docs/ref/#view.EditorProps.nodeViews)。

-   _decorations_:

    目前節點的 prosemirror decorations。
    等同於 [nodeViews 中的 decorations 參數](https://prosemirror.net/docs/ref/#view.EditorProps.nodeViews)。

