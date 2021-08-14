# 解析器

解析器被用于将 markdown 字符串转换为 UI 元素。

## 转换步骤

整个转换过程分为以下步骤：

1. Markdown 字符串将被传给 [remark-parse](https://github.com/remarkjs/remark/tree/main/packages/remark-parse)，被转换为一个 AST。
2. 这个 remark AST 将被 milkdown 解析器遍历。milkdown 解析器通过 node 和 mark 的定义生成。milkdown 解析器会把 AST 转换为一个 prosemirror 的节点树。
3. 生成的 prosemirror 节点树将被 prosemirror 渲染，并生成对应的 UI 元素。

## 例子

对于每一个 node/mark，都需要定义一个解析器声明，它有以下结构：

```typescript
import { nodeFactory } from '@milkdown/core';

const myNode = nodeFactory({
    // other props...
    parser: {
        match: (node) => node.type === 'my-node',
        runner: (state, node, type) => {
            state.openNode(type).next(node.children).closeNode();
        },
    },
});
```

## 解析器声明

解析器声明有 2 个属性:

-   _match_: 匹配需要当前 runner 处理的目标 remark 节点。

-   _runner_: 一个函数，用于将目标 remark 节点转换为 prosemirror 节点, 它有 3 个参数:

    -   _state_: 用来生成 prosemirror 节点的工具。
    -   _node_: 需要被转换的 remark 节点。
    -   _type_: 需要转换为的目标 prosemirror 节点的*[nodeType](https://prosemirror.net/docs/ref/#model.NodeType)*或*[markType](https://prosemirror.net/docs/ref/#model.MarkType)*，
        它是由当前 node/mark 中的 `schema` 属性定义的。

## 解析器 state

解析器 state 用于生成 prosemirror 的 node/mark。
它提供了许多有用的方法来让转换变得十分简单。

首先，我们需要知道我们要处理的是类似下面这种结构：

```typescript
interface NodeTree {
    type: string;
    children: NodeTree[];
    [x: string]: unknown;
}
```

这有助于帮助我们理解 state API。

### openNode & closeNode

`openNode` 方法用于打开一个 prosemirror node，在这之后创建的所有节点都将是被打开的 node 的子节点，直到调用`closeNode`。

你可以将 `openNode` 想象为左括号，那么 `closeNode` 就是右括号。 对于有子节点的情况，你的解析器应该尽量只处理当前节点本身，然后让子节点自己的解析器来处理它自己。

你可以将 node 的标签通过第二个参数传给 `openNode`。

### addNode

`addNode` 意味着直接添加节点而不打开或关闭它，一般用于没有子节点或需要手动处理子节点的情况。

你可以将 node 的标签通过第二个参数传给 `addNode`。

### next

`next` 将节点或节点列表传回给 state，state 会找到合适的 runner（通过检查每个 node/mark 的 `match` 属性）来处理它。

### openMark & closeMark

这两个 API 与 `openNode` 和 `closeNode` 很相似，只不过它们用于创建 prosemirror mark。

你可以将 mark 的标签通过第二个参数传给 `openMark`。
