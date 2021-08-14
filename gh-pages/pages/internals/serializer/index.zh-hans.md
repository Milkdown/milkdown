# 序列化器

序列化器用于将 UI 元素转换为 markdown 字符串.

## 转换步骤

整个转换过程几乎与解析器相反。

1. 对于每一个当前的 UI 状态，都有一个对应的 prosemirror 节点树能够表示它。
2. 这个 prosemirror 节点树将会被序列化器遍历。Milkdown 序列化器通过 node 和 mark 的定义生成。Milkdown 序列化器会把一个 prosemirror 节点树转换为一个 remark AST。
3. 这个 remark AST 将会被传入 [remark-stringify](https://github.com/remarkjs/remark/tree/main/packages/remark-stringify) 来转换为 markdown 字符串。

## 例子

对于每一个 node/mark，都需要定义一个序列化器声明，它有以下结构：

```typescript
import { nodeFactory } from '@milkdown/core';

const MyNode = nodeFactory({
    // other props...
    serializer = {
        match: (node) => node.type.name === 'my-node',
        runner: (state, node) => {
            state.openNode('my-node').next(node.content).closeNode();
        },
    },
});
```

## 序列化器声明

序列化器声明有 2 个属性：

-   _match_: 匹配需要当前 runner 处理的目标 remark 节点。

-   _runner_:

    -   Node runner:
        函数将 prosemirror node 转换到 remark AST，他有 2 个参数：

        -   _state_: 用于生成 remark AST 的工具。
        -   _node_: 当前 runner 要处理的 prosemirror node。

    -   Mark runner:
        函数将 prosemirror mark 转换到 remark AST，他有 3 个参数：

        -   _state_: 用于生成 remark AST 的工具。
        -   _mark_: 当前 runner 要处理的 prosemirror mark。
        -   _node_: 含有当前 mark 的 node。

        > 如果 mark 的 runner 的返回值为 `true` 而不是`undefined` 或 `null`，
        > 那么拥有这个 mark 的 node 也将由当前 runner 处理，而不会交给序列化器的其它部分。

## 序列化器 state

序列化器的 state 被用于生成 remark AST，
它提供了许多有用的方法来让转换变得十分简单。

### openNode & closeNode

`openNode` 方法用于打开一个 remark 节点，在这之后创建的所有节点都将是被打开的 node 的子节点，直到调用`closeNode`。

你可以将 `openNode` 想象为左括号，那么 `closeNode` 就是右括号。 对于有子节点的情况，你的解析器应该尽量只处理当前节点本身，然后让子节点自己的序列化器来处理它自己。

参数：

-   _type_: 节点 的 type 属性。
-   _value_: 节点 的 value 属性。
-   _props_: 节点的其它属性。

这里的 props 会被展开，例如：

```typescript
openNode('my-node', undefined, { foo: true, bar: 0 });
// will generate:
const generatedCode = {
    type: 'my-node',
    foo: true,
    bar: 0,
    children: [
        /* some children */
    ],
};
```

### addNode

`addNode` 意味着直接添加节点而不打开或关闭它，一般用于没有子节点或需要手动处理子节点的情况。

参数：

-   _type_: 节点 的 type 属性。
-   _value_: 节点 的 value 属性。
-   _props_: 节点的其它属性。
-   _children_: 节点的子节点，是一个节点数组。

### next

`next` 将节点或节点列表传回给 state，state 会找到合适的 runner（通过检查每个 node/mark 的`match`属性）来处理它。

### withMark

`withMark` 用于，当前节点包括 mark 时，序列化将会自动将当前节点的 mark 和相邻节点的 mark 进行合并。

Parameters:

-   _mark_: 当前节点的 prosemirror mark。
-   _type_: 节点 的 type 属性。
-   _value_: 节点 的 value 属性。
-   _props_: 节点的其它属性。
