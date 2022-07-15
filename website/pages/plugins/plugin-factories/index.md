# Plugin Factories

In the [previous section](/plugins-101). We showed how to create a bare plugin. Luckily, we don't need to do it in most cases. We can use plugin factories and [composable plugins](/composable-plugins) which we'll introduce in the next section.

We provide 3 factories to create different types of plugins:

-   createNode
-   createMark
-   createPlugin

## Overview

For every plugin factory, it takes a function that returns an object to define the plugin.

Let's create a simple blockquote plugin.

```typescript
const blockquote = createNode(() => {
    const id = 'blockquote';

    return {
        id,
        schema: () => ({
            content: 'block+',
            group: 'block',
            defining: true,
            parseDOM: [{ tag: 'blockquote' }],
            toDOM: (node) => ['blockquote', 0],
            parseMarkdown: {
                match: ({ type }) => type === id,
                runner: (state, node, type) => {
                    state.openNode(type).next(node.children).closeNode();
                },
            },
            toMarkdown: {
                match: (node) => node.type.name === id,
                runner: (state, node) => {
                    state.openNode(id).next(node.content).closeNode();
                },
            },
        }),
    };
});

// usage
editor.use(blockquote());
```

With this plugin, we can now create blockquote.

---

## Properties

Now let's take a closer look at each part of the plugin.

### id

> `string`

First of all, we define an `id` for the plugin.
This id should be unique for every plugin.
It used to identify which the plugin it is in the editor.

### schema

```typescript
// createNode
type schema = (ctx: Ctx) => NodeSchema;

// createMark
type schema = (ctx: Ctx) => MarkSchema;

// createPlugin
type schema = (ctx: Ctx) => {
    node: Record<string, NodeSchema>;
    mark: Record<string, MarkSchema>;
};
```

The schema is a superset of the prosemirror schema.
For the `createNode` factory, it's a superset of [prosemirror node schema spec](https://prosemirror.net/docs/ref/#model.NodeSpec).
And for the `createMark` factory, it's a superset of [prosemirror mark schema spec](https://prosemirror.net/docs/ref/#model.MarkSpec).

For `createPlugin` factory, you can create multiple nodes and marks. For example:

```typescript
const myPlugin = createPlugin(() => {
    return {
        id: 'myPlugin',
        schema: () => ({
            node: {
                paragraph: {},
                blockquote: {},
            },
            mark: {
                bold: {},
            },
        }),
    };
});
```

If you don't familiar with prosemirror, I highly recommend you to read their definition in prosemirror to make sure you understand what's going on.

The schema is used to define the structure of the node/mark. It has mainly 3 parts of properties:

1. `parseDOM` and `toDOM`: This is used to define how the node/mark is rendered to DOM and parsed from DOM. Same as the prosemirror node/mark spec.
2. `parseMarkdown` and `toMarkdown`: This is used to define how the node/mark is parsed from markdown AST and serialized to markdown AST. That's also the properties in schema that are milkdown only.
3. Other properties: This is used to define the behavior of the node/mark. Same as the prosemirror node/mark spec.

#### SchemaType

For every plugin factory, there will be a schema type decides by the schema.
For `createNode`, it's `NodeSchema`.
For `createMark`, it's `MarkSchema`.
And for `createPlugin`, it's an object.

For example, the `myPlugin` we defined above will have this schema type:

```typescript
type SchemaTypeOfMyPlugin = {
    node: {
        paragraph: NodeType;
        blockquote: NodeType;
    };
    mark: {
        bold: MarkType;
    };
};
```

The SchemaType will be used in following other properties in plugin factory:

-   [commands](#commands)
-   [inputRules](#inputrules)
-   [prosePlugins](#proseplugins)

### commands

> `type commands = (type: SchemaType, ctx: Ctx) => Commands[]`

You can add commands to milkdown to let other parts in the editor can use it.
For example, we want other components such as a menubar or a dropdown list can create a blockquote. We can add a command called `WrapInBlockquote`. And then other components can just call `WrapInBlockquote` command to create a blockquote without knowing the details of the plugin.

```typescript
const WrapInBlockquote = createCmdKey('WrapInBlockquote');
const blockquote = createNode(() => {
    const id = 'blockquote';
    return {
        id,
        // ...
        commands: (type) => [createCmd(WrapInBlockquote, () => wrapIn(type))],
    };
});

// In Other Component
ctx.get(commandsCtx).call('WrapInBlockquote');
```

For more details of commands, please check [commands](/commands).

### inputRules

> `(schemaType: SchemaType, ctx: Ctx) => InputRule[]`

This property is used to define what string users type into the editor that will trigger the command. For example, we expect the user can type `>` with a `space` to create a blockquote.

```typescript
import { wrappingInputRule } from '@milkdown/prose/inputrules';
const blockquote = createNode(() => {
    const id = 'blockquote';

    return {
        id,
        // ...
        inputRules: (type) => [wrappingInputRule(/^\s*>\s$/, type)],
    };
});
```

InputRules is a part from prosemirror. If you want to know more details or create your own inputrules, please check [prosemirror-inputrules](https://prosemirror.net/docs/ref/#inputrules).

### prosePlugins

> `(schemaType: SchemaType, ctx: Ctx) => ProsemirrorPlugin[]`

This property is used to define the [prosemirror plugins](https://prosemirror.net/docs/ref/#state.Plugin_System).
Prosemirror plugins can be used to extend behavior to the editor.
For example, we can add a tooltip or placeholder to the editor.

### shortcuts

> `Record<string, Shortcut>`

Shortcuts defines what key combination will trigger the command.
For example, we expect the user can type `Mod-Shift-b` to create a blockquote.

```typescript
const WrapInBlockquote = createCmdKey('WrapInBlockquote');
const blockquote = createNode<'Blockquote'>(() => {
    const id = 'blockquote';

    return {
        id,
        // ...
        shortcuts: {
            Blockquote: createShortcut(WrapInBlockquote, 'Mod-Shift-b'),
        },
    };
});
```

Here we define a shortcut for this plugin. When user types `Mod-Shift-b`, the command `WrapInBlockquote` will be triggered.

#### Custom Shortcuts

The advantage of using shortcuts is that when other users use your plugin, they can customize the behavior of the shortcut.

```typescript
const blockquoteWithUserDefinedShortcut = blockquote({
    keymap: {
        Blockquote: 'Mod-Alt-b',
    },
});
```

The user now can type `Mod-Alt-b` to create a blockquote instead of the original keyboard shortcut.

### view

> `(ctx: Ctx) => ViewFactory`

This property is used to define [node view](https://prosemirror.net/docs/ref/#view.NodeView) for the plugin.
It provides you a way to control the DOM rendered by the node.
It is more powerful than `toDOM` in the schema, but much more complicated.

### remarkPlugin

> `(ctx: Ctx) => RemarkPlugin[]`

This property is used to define [remark plugin](https://github.com/remarkjs/remark/blob/main/doc/plugins.md).
It's used to extend the behavior of parser and serializer.
Most of the time if you want to define your own markdown syntax, you should use remark plugin.

---

## Inject Slices

You may want to inject slices into a plugin to let them can be accessed or updated by other parts in the editor.

```typescript
import { createSlice } from '@milkdown/core';
class MyState {
    value: string;

    getValue() {
        return this.value;
    }

    setValue(value: string) {
        this.value = value;
    }
}

const blockquoteState = createSlice(new MyState(), 'blockquote');
const blockquote = createNode<'Blockquote'>(() => {
    const id = 'blockquote';

    return {
        id,
        schema: (ctx) => {
            const myState = ctx.get(blockquoteState);
            doSomething(myState.getValue());
        },
        // ...
    };
}, [blockquoteState]);

// Users can do:
Editor.make()
    .config((ctx) => {
        ctx.get(blockquoteState).setValue('My Config Value');
    })
    // ...
    .create();
```

---

## Style

You may want to add style for your plugin if it has a user interface.
We provide some utils for you to add styles to your plugin.
You can get them from the first parameter of the plugin factory.

### getStyle

> `(callback: (emotion: Emotion) => string | undefined) => void`

The function `getStyle` is used to create style with a callback.
The `Emotion` here is same with the [emotion library](https://emotion.sh/docs/@emotion/css).

```typescript
import { getPalette } from '@milkdown/core';
const blockquote = createNode(({ getStyle, themeManager }) => {
    const id = 'blockquote';
    return {
        id,
        schema: () => ({
            // ...
            toDOM: (node) => {
                const blockquote$ = document.createElement('blockquote');

                themeManager.onFlush(() => {
                    blockquote$.className = getStyle((emotion) => {
                        const palette = getPalette(themeManager);
                        return emotion.css`
                            background-color: ${palette('background')};
                            border-left: 3px solid ${palette('primary')};
                            padding: 0.5em 1em;
                            margin: 0;
                        `;
                    });
                });

                return {
                    dom: blockquote$,
                    contentDOM: blockquote$,
                };
            },
        }),
    };
});
```

The reason why we need to use `getStyle` is that with this method,
we can make this plugin support [headless mode](/styling#headless-mode) automatically.
In headless mode, all styles created by `getStyle` will be erased.
Users can set this plugin to headless mode by:

```typescript
const headlessBlockquote = blockquote({
    headless: true,
});
```

You may also notice that we put our style into `themeManager.onFlush`.
That's because we want to flush the style when the theme changes.

### getClassName

> `(attrs: Attrs, ...defaultValue: (string | null | undefined)[]) => string`

The function `getClassName` is used to create one or more class names with a callback.

```typescript
const blockquote = createNode(({ getClassName }) => {
    const id = 'blockquote';
    return {
        id,
        schema: () => ({
            // ...
            toDOM: (node) => {
                const blockquote$ = document.createElement('blockquote');

                blockquote$.className = getClassName(node.attrs, 'blockquote', 'milkdown-blockquote');

                return {
                    dom: blockquote$,
                    contentDOM: blockquote$,
                };
            },
        }),
    };
});
```

With the code above, the blockquote will have the class `blockquote` and `milkdown-blockquote`.
It also brings the convenience that we can let users [decide the class name by themselves](/styling#option-2:-add-custom-class-name).
Here's an example:

```typescript
const blockquoteWithCustomClassName = blockquote({
    className: (attrs) => 'custom-blockquote',
});
```

---

## Options

Some plugins may want the user to configure some options.
For example, a plugin with text may want the user to decide the content for i18n.

You can get them from the second parameter of the plugin factory.

```typescript
type Options = {
    okText: string;
    cancelText: string;
};
const button = createPlugin<Options>((utils, options) => {
    const okText = options?.okText ?? 'ok';
    const cancelText = options?.cancelText ?? 'cancel';
});

// user usage:
const buttonWithMyText = button({
    okText: 'OK',
    cancelText: 'Cancel',
});
```

Keep in mind that all options should be treated as **optional**.
Which means user can choose not to set the option.
So you'd better set default value for all of them.

## Extend

Every plugin created by factory can be extended.
If you just want to modify some behavior of exists plugin, extend is better than rewrite a new one.

```typescript
const extendedBlockquote = blockquote.extend((original, utils, options) => {
    return {
        ...original,
        schema: (ctx) => {
            return {
                ...original.schema(ctx),
                // some custom schema
            };
        },
    };
});
```

Here we have 3 parameters.
The `options` and `utils` have been introduced.
And the `original` is the original plugin to be extended.
The extend method should always return a new plugin.

## AtomList

In a complex real world app, we may want to create a list of plugins.
Let users `use` them one by one might be a little bit complicated.
So we provide a utility to create a list of plugins.
With this list, users can use, extend and configure them easily.

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
const myNode1 = node1.extend(/* ... */);
Editor.use(mySyntaxPlugin.replace(node1, myNode1()));
```

## Real World Examples

In Milkdown, most of the plugins are defined using plugin factories.

You can view the source of [preset-commonmark](https://github.com/Saul-Mirone/milkdown/tree/main/packages/preset-commonmark/src) to see how we use them in real world.
