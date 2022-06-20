# Composable Plugins

Plugin factories are really powerful. But they might be too heavy for some uses cases.
For example, if you just want to create a simple wrapper for a existing prosemirror plugin.
Or if you want to create some small pieces too make some complex plugins.

That's why we provides composable plugin API.
It's designed to make it possible to create simple plugins that can be composed with each other plugins.

## Remark Plugin

```typescript
import { $remark } from '@milkdown/utils';

const myRemarkPlugin = $remark((ctx) => remarkPlugin);

Editor.use(myRemarkPlugin);
```

After created by `$remark`, the remark plugin has metadata on it:

-   plugin: The original remark plugin.

## Node & Mark

```typescript
import { $node } from '@milkdown/utils';

const myNode = $node('my-node', (ctx) => {
    return {
        atom: true,
        toDOM: () => ['my-node'],
        parseDOM: [{ tag: 'my-node' }],
        toMarkdown: {
            //...
        },
        parseMarkdown: {
            //...
        },
    };
});

const myMark = $mark('my-mark', (ctx) => {
    return {
        /* mark schema */
    };
});

Editor.use(myNode).use(myMark);
```

Nodes and marks created by `$node` and `$mark` has metadata on it:

-   id: The id of the node or mark.
-   type: The prosemirror node type or mark type.
-   schema: The original schema of the node or mark.

## InputRule

```typescript
import { $inputRule } from '@milkdown/utils';
import { schemaCtx } from '@milkdown/core';
import { wrappingInputRule } from '@milkdown/prose/inputrules';

const myNode = $node(/* ... */);

const inputRule1 = $inputRule((ctx) => {
    return wrappingInputRule(/^\[my-node\]/, myNode.type);
});

const inputRule2 = $inputRule((ctx) => {
    return wrappingInputRule(/^\[my-node\]/, ctx.get(schemaCtx).nodes['my-node'].type);
});
```

After created by `$inputRule`, the input rule has metadata on it:

-   inputRule: The original input rule.

## Command

```typescript
import { $command } from '@milkdown/utils';
import { createCmd, createCmdKey } from '@milkdown/core';
import { wrapIn } from '@milkdown/prose/command';

const myNode = $node(/* ... */);

export const WrapInMyBlock = createCmdKey<number>();

const myCommand = $command((ctx) => {
    return createCmd(WrapInMyBlock, (level = 1) => wrapIn(myNode.type, level));
});
```

After created by `$command`, the command has metadata on it:

-   run: To run the created command.
    For example: `myCommand.run(1)` will wrap the current selection with `myNode.type` with level 1.
-   key: The key of the command.
    For example: `myCommand.key` will return `WrapInMyBlock`.

## Shortcut

```typescript
import { $shortcut } from '@milkdown/utils';

const myCommand = $command(/* ... */);

const myShortcut = $shortcut((ctx) => {
    return {
        'Mod-Alt-1': () => myCommand.run(1),
        'Mod-Alt-2': () => myCommand.run(2),
    };
});
```

After created by `$shortcut`, the shortcut has metadata on it:

-   keymap: The shortcut keymap.

## Prosemirror Plugin

```typescript
import { $prose } from '@milkdown/utils';
import { Plugin } from '@milkdown/prose/state';

const myProsePlugin = $prose((ctx) => {
    return new Plugin({
        //...
    });
});
```

After created by `$prose`, the prosemirror plugin has metadata on it:

-   plugin: The original prosemirror plugin.

## View

```typescript
import { $view } from '@milkdown/utils';

const myNode = $node(/* ... */);

const myNodeView = $view(myNode, (ctx) => {
    return (node, view, getPos, decorations) => {
        return nodeViewImpl;
    };
});
```

After created by `$view`, the view has metadata on it:

-   type: The original `$node` or `$mark` for the view that passed in as the first parameter.
-   view: The original view.

## Promise Support

For every composable plugin API, there will be an `async` version for it to add promise support,

For example:

```typescript
import { $prose, $proseAsync } from '@milkdown/utils';
import { Plugin } from '@milkdown/prose/state';

const myProsePlugin = $prose((ctx) => {
    return new Plugin({
        //...
    });
});

const myAsyncProsePlugin = $proseAsync(async (ctx) => {
    await somePromise();

    return new Plugin({
        //...
    });
});
```
