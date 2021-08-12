# Node & Mark

Node 和 Mark 是两个结构，它们被用于定义 prosemirror 的 [Node](https://prosemirror.net/docs/ref/#model.Node) 和 [Mark](https://prosemirror.net/docs/ref/#model.Mark).

## 概览

用户可以简单的用以下代码来定义一个 node:

```typescript
import { nodeFactory } from '@milkdown/core';
// mark也是类似
import { markFactory } from '@milkdown/core';

const id = 'paragraph';
const paragraph = nodeFactory({
    id,
    schema: {
        content: 'inline*',
        group: 'block',
        parseDOM: [{ tag: 'p' }],
        toDOM: () => ['p', { class: 'paragraph' }, 0],
    },
    parser: {
        match: (node) => node.type === id,
        runner: (state, node, type) => {
            state.openNode(type).next(node.children).closeNode();
        },
    },
    serializer: {
        match: (node) => node.type.name === id,
        runner: (state, node) => {
            state.openNode('paragraph').next(node.content).closeNode();
        },
    },
});
```

---

## 属性

对于每个 node/mark，我们需要实现 4 个必须属性, 我们还可以实现 4 个可选属性。

### id

**必须。** node/mark 的标识符，也会被用于当作 [prosemirror schema][schema] 的 key。

### schema

**必须。** 当前 node/mark 的[prosemirror schema][schema] 定义。

### parser

**必须。** 当前 node/mark 的 parser 定义，用于规定 markdown 被如何转换为目标节点。

### serializer

**必须。** 当前 node/mark 的 serializer 定义，用于规定当前节点被如何转换为 markdown。

### inputRules?

**可选。** 当前 node/mark 创建的 [prosemirror input rules][input-rules]。用于匹配用户的特定输入规则来做响应，例如输入```自动生成代码块。

### commands?

**可选。** 当前 node/mark 创建的 [prosemirror commands][commands]。用于定义命令来程序化的操作编辑器。

### keymap?

**可选。** 当前 node/mark 创建的 [prosemirror key map][key-map]。用于定义快捷键，将其绑定到对应的 command。

### view?

**可选。** 用于渲染当前 node/mark 的 [prosemirror node view][node-view]。用于为 node/mark 定义特殊的渲染逻辑。

---

> 你可以在官方仓库中找到更多例子，例如 [preset-commonmark][preset-commonmark] 和 [preset-gfm][preset-gfm]。
>
> 在真实世界中，我们推荐你使用[@milkdown/utils][utils]中的`createNode`和`createMark`方法，他们可以很大程度上简化 node/mark 的定义。

[schema]: https://prosemirror.net/docs/ref/#model.Schema
[input-rules]: https://prosemirror.net/docs/ref/#inputrules.InputRule
[key-map]: https://prosemirror.net/docs/ref/#keymap
[node-view]: https://prosemirror.net/docs/ref/#view.NodeView
[commands]: https://prosemirror.net/docs/guide/#commands
[preset-commonmark]: https://github.com/Saul-Mirone/milkdown/tree/main/packages/preset-commonmark
[preset-gfm]: https://github.com/Saul-Mirone/milkdown/tree/main/packages/preset-gfm
[utils]: https://github.com/Saul-Mirone/milkdown/tree/main/packages/utils
