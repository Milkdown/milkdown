# Node & Mark

Node and Mark are two structures that used to define prosemirror [Node](https://prosemirror.net/docs/ref/#model.Node) and [Mark](https://prosemirror.net/docs/ref/#model.Mark).

## Overview

Users can easily define a node by the following code:

```typescript
import { nodeFactory } from '@milkdown/core';

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

## Properties

There are 4 required properties and 3 optional properties need to be implemented by every node/mark.

### id

**Required.** The identifier of the node/mark, will be used as key of [prosemirror schema][schema].

### schema

**Required.** The [prosemirror schema][schema] specification of this node/mark.

### parser

**Required.** The parser specification, used to define the parsing process of current node/mark.

### serializer

**Required.** The serializer specification, used to define the serializing process of current node/mark.

### inputRules?

**Optional.** The [prosemirror input rules][input-rules] this node/mark creates. It's used to match the user input and generate response for them, such as input ``` to generate code fence.

### commands?

**Optional.** The [prosemirror commands][commands] this node/mark creates. It's used to define commands to operate the editor programmatically.

### keymap?

**Optional.** The [prosemirror key map][key-map] this node/mark creates. It's used to define keyboard shortcuts and bind them to target command.

### view?

**Optional.** The [prosemirror node view][node-view] of this node/mark. It's used to define special render logic for current node/mark.

---

> You can find more examples in the official repositories like [preset-commonmark][preset-commonmark] and [preset-gfm][preset-gfm].
>
> In real world, we recommend you to use `createNode` and `createMark` from [@milkdown/utils][utils], they can make define node/mark much easier.

[schema]: https://prosemirror.net/docs/ref/#model.Schema
[input-rules]: https://prosemirror.net/docs/ref/#inputrules.InputRule
[key-map]: https://prosemirror.net/docs/ref/#keymap
[node-view]: https://prosemirror.net/docs/ref/#view.NodeView
[commands]: https://prosemirror.net/docs/guide/#commands
[preset-commonmark]: https://github.com/Saul-Mirone/milkdown/tree/main/packages/preset-commonmark
[preset-gfm]: https://github.com/Saul-Mirone/milkdown/tree/main/packages/preset-gfm
[utils]: https://github.com/Saul-Mirone/milkdown/tree/main/packages/utils
