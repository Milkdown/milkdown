# Node & Mark

Node and Mark are two special atoms that used to define prosemirror [Node](https://prosemirror.net/docs/ref/#model.Node) and [Mark](https://prosemirror.net/docs/ref/#model.Mark).

## Overview

Users can easily define a node by the following code:

```typescript
import { NodeParserSpec, NodeSerializerSpec, Node } from '@milkdown/core';

export class Paragraph extends Node {
    id = 'paragraph';
    schema = {
        content: 'inline*',
        group: 'block',
        parseDOM: [{ tag: 'p' }],
        toDOM: () => ['p', { class: 'paragraph' }, 0] as const,
    };
    override readonly parser: NodeParserSpec = {
        match: (node) => node.type === this.id,
        runner: (state, node, type) => {
            state.openNode(type).next(node.children).closeNode();
        },
    };
    override readonly serializer: NodeSerializerSpec = {
        match: (node) => node.type.name === this.id,
        runner: (state, node) => {
            state.openNode('paragraph').next(node.content).closeNode();
        },
    };
}
```

> You can also add `readonly override` for every properties to have a safer code.
>
> Such as `readonly override id: 'paragraph'`.

---

## Properties

**Required.** There are 4 required properties and 3 optional properties need to be implemented by every node/mark.

### id

**Required.** The identifier of the node/mark, will be used as key of prosemirror schema.

### schema

**Required.** The prosemirror [schema](https://prosemirror.net/docs/ref/#model.Schema) specification of this node/mark.

### parser

**Required.** The parser specification, used to register the node/mark in parser.

### serializer

**Required.** The serializer specification, used to serialize the node/mark into string in serializer.

### inputRules?

**Optional.** The prosemirror [input rules](https://prosemirror.net/docs/ref/#inputrules.InputRule) this node/mark creates.

### keymap?

**Optional.** The prosemirror [key map](https://prosemirror.net/docs/ref/#keymap) this node/mark creates.

### view?

**Optional.** The prosemirror [node view](https://prosemirror.net/docs/ref/#view.NodeView) of this node/mark.

---

> You can find more examples in the official repositories like [preset-commonmark](https://github.com/Saul-Mirone/milkdown/tree/main/packages/preset-commonmark) and [plugin-table](https://github.com/Saul-Mirone/milkdown/tree/main/packages/plugin-table).
