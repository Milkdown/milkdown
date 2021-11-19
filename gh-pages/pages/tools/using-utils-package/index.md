# Using Utils Package

We provide a [util package](https://www.npmjs.com/package/@milkdown/utils) to provide more abilities and convenience when writing plugins.

# Factory

The util package provides three factory functions:

-   _createPlugin_:
    Create a general plugin.
-   _createNode_:
    Create a [prosemirror node](https://prosemirror.net/docs/ref/#model.Node).
-   _createMark_:
    Create a [prosemirror mark](https://prosemirror.net/docs/ref/#model.Mark).

## Options

Some times you may want the plugins can be configured with different options.
With factories provided in util package, you can easily implement this:

```typescript
import { createPlugin } from '@milkdown/utils';

type Options = {
    color: string;
};

export const myPlugin = createPlugin<Options>((utils, options) => {
    // All options must have a default value.
    const color = options?.color ?? '#fff';

    return {
        // ...define your plugin
    };
});

// Usage:
// Default
Editor.use(myPlugin());

// Custom Config
Editor.use(myPlugin({ color: '#000' }));
```

## Utils

We provide some utils to make build features more easily.

### getStyle

With the `getStyle` function, you can:

-   Access the design system through [themeTool](/#/design-system).
-   Make your style adapt the **headless mode**.

```typescript
import { createPlugin } from '@milkdown/utils';
import { css } from '@emotion/css';

type Options = {
    color: string;
};

export const myPlugin = createPlugin((utils) => {
    const className = utils.getStyle((themeTool) => {
        const primaryColor = themeTool.palette('primary');
        const { shadow } = themeTool.mixin;

        return css`
            ${shadow};
            color: ${primaryColor};
        `;
    });

    return {
        // ...define your plugin
    };
});

// Headless mode:
// In headless mode, style created by `getStyle` will be disabled.
Editor.use(myPlugin({ headless: true }));
```

### getClassName

The `getClassName` function is a shortcut for users to create class name.

```typescript
import { createNode } from '@milkdown/utils';

export const myNode = createNode<Keys>((utils, options) => {
    const id = 'myNode';
    const style = 'my-class-name';

    return {
        id,
        schema: {
            content: 'inline*',
            group: 'block',
            parseDOM: [{ tag: 'div' }],
            toDOM: (node) => ['div', { class: utils.getClassName(node.attrs, id, style) }, 0],
            // ...other props
        },
        // ...other props
    };
});
```

In the example above, by default, the generated block will be a `div` element with the className: `myNode my-class-name`. Users can also add custom class name by options:

```typescript
Editor.use(
    myNode({
        className: (attrs) => ['my-custom-node-className', attrs.disabled && 'disabled'],
    }),
);
```

### ctx

You can also get the editor _ctx_.

```typescript
import { rootCtx } from '@milkdown/core';
import { createPlugin } from '@milkdown/utils';

export const myPlugin = createPlugin((_, utils) => {
    const { ctx } = utils;
    const getRootElement = () => ctx.get(rootCtx);

    return {
        // ...define your plugin
        // Get root element
        // const rootElement = getRootElement();
    };
});
```

## Commands and Shortcuts

In plugin factory, define commands and shortcuts are much easier.

For example in heading node:

```typescript
import { createCmd, createCmdKey } from '@milkdown/core';
import { createNode, createShortcut } from '@milkdown/utils';
import { setBlockType } from '@milkdown/prose';

type Keys = 'H1' | 'H2' | 'H3';

export const TurnIntoHeading = createCmdKey<number>();
export const heading = createNode<Keys>((_, utils) => {
    const id = 'heading';

    return {
        id,
        schema: {
            content: 'inline*',
            group: 'block',
            attrs: {
                level: {
                    default: 1,
                },
            },
            parseDOM: [1, 2, 3].map((x) => ({ tag: `h${x}`, attrs: { level: x } })),
            toDOM: (node) => [`h${node.attrs.level}`, 0],
            // ...some other props
        },
        // ...some other props

        // Implement the commands
        commands: (nodeType) => [createCmd(TurnIntoHeading, (level = 1) => setBlockType(nodeType, { level }))],

        // Map the commands to keys
        shortcuts: {
            [SupportedKeys.H1]: createShortcut(TurnIntoHeading, 'Mod-Alt-1', 1),
            [SupportedKeys.H2]: createShortcut(TurnIntoHeading, 'Mod-Alt-2', 2),
            [SupportedKeys.H3]: createShortcut(TurnIntoHeading, 'Mod-Alt-3', 3),
        },
    };
});
```

In this example, we use `createCmdKey` to register a command, and use `createCmd` to implement it.
The type variable `number` means this command can be called with a `number` as parameter.
And then, we can use the command to create shortcuts.

With this pattern, we also provides the ability to remap these shortcuts.

```typescript
Editor.use(
    heading({
        keymap: {
            H1: 'Mod-shift-1',
            H2: 'Mod-shift-2',
            H3: 'Mod-shift-3',
        },
    }),
);
```

You may notice the `Keys` type we defined, that's used to tell typescript the shortcuts the node or mark support.
If users provide a keymap out of scope, the typescript will let them know:

```typescript
Editor.use(
    heading({
        keymap: {
            // Throw an error when compiled by typescript.
            H4: 'Mod-shift-4',
        },
    }),
);
```

## Extend

Every plugin created by factory can be extended.
If you just want to modify some behavior of exists plugin, extend is better than rewrite a new one.

```typescript
import { heading } from '@milkdown/preset-commonmark';
const customHeading = heading.extend((original, utils, options) => {
    return {
        ...original,
        schema: customSchema,
    };
});
```

Here we have 3 parameters. The `options` and `utils` have been introduced. And the `original` is the original plugin to be extended.
The `extend` method should return a new plugin.

You can also use type parameters to change the type signature of `options` and `keys`:

```typescript
import { heading } from '@milkdown/preset-commonmark';
const customHeading = heading.extend<CustomKeys, CustomOptions>((original, utils, options) => {
    return {
        ...original,
        schema: customSchema,
    };
});
```

# AtomList

In the real world, a package always composed by a series of milkdown plugins.
`AtomList` can help users to use and configure a list of plugins more easily.

```typescript
import { createNode, AtomList } from '@milkdown/utils';
const node1 = createNode(/* node1 */);
const node2 = createNode(/* node2 */);
const node3 = createNode(/* node3 */);

const mySyntaxPlugin = AtomList.create([node1(), node2(), node3()]);

Editor.use(mySyntaxPlugin);

// With configure:
Editor.use(
    mySyntaxPlugin.configure(node1, {
        keymap: {
            //...
        },
    }),
);
// Equal to:
Editor.use([
    node1({
        keymap: {
            //...
        },
    }),
    node2(),
    node3(),
]);

// Enable headless mode for all:
Editor.use(mySyntaxPlugin.headless());

// Remove one plugin:
Editor.use(mySyntaxPlugin.remove(node1));

// Replace one plugin:
const myNode1 = createNode(/* ... */);
Editor.use(mySyntaxPlugin.replace(node1, myNode1));
```

# Composable Plugins

Sometimes users don't want to provide a whole plugin, but just a part of it.
Or they want to compose a plugin with other plugins.
At this time we can use composable plugins.

## Remark Plugin

```typescript
import { $remark } from '@milkdown/utils';

const myRemarkPlugin = $remark((ctx) => remarkPlugin);

Editor.use(myRemarkPlugin);
```

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

Editor.use(myNode);
```

Nodes and marks created by `$node` and `$mark` has metadata on it:

-   id: The id of the node or mark.
-   type: The prosemirror node type or mark type.
-   schema: The original schema of the node or mark.

## InputRule

```typescript
import { $inputRule } from '@milkdown/utils';
import { schemaCtx } from '@milkdown/core';
import { wrappingInputRule } from '@milkdown/prose';

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
import { wrapIn } from '@milkdown/prose';

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
import { Plugin } from '@milkdown/prose';

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
