# Composable Plugins

In the previous section, we showed you how to create a plugin from scratch. Luckily, you don't need to do that in most cases. Milkdown provides a lot of helpers in [@milkdown/utils](/utils) to make it easier to create plugins. The **composable** here means that you can use the plugin in other plugins. For example, you can use a command plugin in a keymap plugin. This is a very common pattern in Milkdown.

## Schema

The schema plugin is the most important plugin in Milkdown. It defines the structure of the document. A schema plugin in milkdown is a super set of the [node schema spec](https://prosemirror.net/docs/ref/#model.NodeSpec) or [mark schema spec](https://prosemirror.net/docs/ref/#model.MarkSpec) in ProseMirror.

Let's create a simple blockquote node plugin as an example:

```typescript
import { $node } from '@milkdown/utils';

const blockquote = $node('blockquote', () => ({
  content: 'block+',
  group: 'block',
  defining: true,
  parseDOM: [{ tag: 'blockquote' }],
  toDOM: node => ['blockquote', ctx.get(blockquoteAttr.key)(node), 0],
  parseMarkdown: {
    match: ({ type }) => type === 'blockquote',
    runner: (state, node, type) => {
      state.openNode(type).next(node.children).closeNode()
    },
  },
  toMarkdown: {
    match: node => node.type.name === 'blockquote',
    runner: (state, node) => {
      state.openNode('blockquote').next(node.content).closeNode()
    },
  },
}));
```

It contains a lot of code, but don't worry, we will explain it one by one.

1. The first argument of `$node` is the node id.
2. The second argument is a function that returns a node schema spec.

### Schema Spec

A schema spec is an object that contains the following properties:

#### 1. `parseDOM` and `toDOM`

`parseDOM` is used to parse the DOM node to the node in the editor. It should be an array of objects. You can view the API of it in the [ProseMirror ParseRule](https://prosemirror.net/docs/ref/#model.ParseRule).

`toDOM` is used to convert the node in the editor to a DOM node. It should be a function that returns an array. You can view the API of it in the [ProseMirror DOMOutputSpec](https://prosemirror.net/docs/ref/#model.DOMOutputSpec).

#### 2. `parseMarkdown` and `toMarkdown`

#### 3. Other Properties

Other properties are the same as the node/mark spec in ProseMirror. They are used to define the structure of the node/mark. You can view the API of it in the [ProseMirror NodeSpec](https://prosemirror.net/docs/ref/#model.NodeSpec) and [ProseMirror MarkSpec](https://prosemirror.net/docs/ref/#model.MarkSpec).
