# Composable Plugins

In the previous section, we showed you how to create a plugin from scratch. Luckily, you don't need to do that in most cases. Milkdown provides a lot of helpers in [@milkdown/utils](/utils) to make it easier to create plugins. The **composable** here means that you can use the plugin in other plugins. For example, you can use a command plugin in a keymap plugin. This is a very common pattern in Milkdown.

I'll show you some examples of how to use composable plugins. But I won't go into detail about the options and the usage of each plugin. You can find the details in the [API reference](/utils#composable).

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

## Input Rule

Since we have a blockquote node, we can create an input rule plugin to make it easier to create a blockquote node.
We expect that when we type `> ` at the beginning of a line, the blockquote node will be created.

```typescript
import { wrappingInputRule } from '@milkdown/prose/inputrules'
import { $inputRule } from '@milkdown/utils'

export const wrapInBlockquoteInputRule = $inputRule(() => wrappingInputRule(/^\s*>\s$/, blockquoteSchema.type()))
```

## Command

We can also create a command plugin to create a blockquote node.
The command is useful when we want to create a button to create a blockquote node.

```typescript
import { wrapIn } from '@milkdown/prose/commands'
import { $command } from '@milkdown/utils'

export const wrapInBlockquoteCommand = $command('WrapInBlockquote', () => () => wrapIn(blockquoteSchema.type()))
```

## Shortcut

We can also create a shortcut plugin for blockquote.
Here we use `Ctrl + Shift + B` as the shortcut. When we press this shortcut, the blockquote node will be created.
And we can also use the command we created in the previous section.

```typescript
import { $useKeymap } from '@milkdown/utils'
import { commandsCtx } from '@milkdown/core'

export const blockquoteKeymap = $useKeymap('blockquoteKeymap', {
  WrapInBlockquote: {
    shortcuts: 'Mod-Shift-b',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(wrapInBlockquoteCommand.key)
    },
  },
})
```
