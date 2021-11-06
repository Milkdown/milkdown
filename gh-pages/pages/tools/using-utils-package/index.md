# Using Utils Package

We provide a [util package](https://www.npmjs.com/package/@milkdown/utils) to provide more abilities and convenience when writing plugins.

# Factory

The util package provides three factory functions:

-   _createPlugin_:
    Create a [prosemirror plugin](https://prosemirror.net/docs/ref/#state.Plugin_System).
-   _createNode_:
    Create a [prosemirror node](https://prosemirror.net/docs/ref/#model.Node).
-   _createMark_:
    Create a [prosemirror mark](https://prosemirror.net/docs/ref/#model.Mark).

## Options

Some times you may want the plugins can be configured with different options.
With factories provided in util package, you can easily implement this:

```typescript
import { createProsePlugin } from '@milkdown/utils';
import { Plugin } from '@milkdown/prose';

type Options = {
    color: string;
};

export const myProsemirrorPlugin = createProsePlugin<Options>((options) => {
    // All options must have a default value.
    const color = options?.color ?? '#fff';

    return new Plugin({
        // ...define your plugin
    });
});

// Usage:
// Default
Editor.use(myProsemirrorPlugin());

// Custom Config
Editor.use(myProsemirrorPlugin({ color: '#000' }));
```

## Utils

We provide some utils to make build features more easily.

### getStyle

With the `getStyle` function, you can:

-   Access the design system through [themeTool](/#/design-system).
-   Make your style adapt the **headless mode**.

```typescript
import { createProsePlugin } from '@milkdown/utils';
import { Plugin } from '@milkdown/prose';
import { css } from '@emotion/css';

type Options = {
    color: string;
};

export const myProsemirrorPlugin = createProsePlugin((_, utils) => {
    const className = utils.getStyle((themeTool) => {
        const primaryColor = themeTool.palette('primary');
        const { shadow } = themeTool.mixin;

        return css`
            ${shadow};
            color: ${primaryColor};
        `;
    });

    return new Plugin({
        // ...define your plugin
    });
});

// Headless mode:
// In headless mode, style created by `getStyle` will be disabled.
Editor.use(myProsemirrorPlugin({ headless: true }));
```

### getClassName

The `getClassName` function is a shortcut for users to create class name.

```typescript
import { createNode } from '@milkdown/utils';

export const myNode = createNode<Keys>((options, utils) => {
    const id = 'myNode';
    const style = 'my-class-name';

    return {
        id,
        schema: {
            content: 'inline*',
            group: 'block',
            parseDOM: [{ tag: 'div' }],
            toDOM: (node) => ['div', { class: utils.getClassName(node.attrs, id, style) }, 0],
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
import { createProsePlugin } from '@milkdown/utils';

export const myProsemirrorPlugin = createProsePlugin((_, utils) => {
    const { ctx } = utils;
    const getRootElement = () => ctx.get(rootCtx);

    return new Plugin({
        // ...define your plugin
        // Get root element
        const rootElement = getRootElement();
    });
});
```

## Commands and Shortcuts

In **node and mark**, define commands and shortcuts are much easier.

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
