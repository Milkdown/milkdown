# 插件工厂

在[上一章](/zh-hans/plugins-101).我们展示了如何不借助任何工具创建一个插件。
幸运的是，我们不需要在大多数情况下从零开始。我们可以使用插件工厂和[可组合插件](/zh-hans/composable-plugins)来创建插件。

我们提供 3 种方式来创建不同类型的插件：

-   createNode
-   createMark
-   createPlugin

## 概览

对于每个插件工厂，它都会接受一个函数，返回一个插件创建函数。

让我们创建一个简单的 blockquote 插件。

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

// 使用
editor.use(blockquote());
```

通过这个插件，我们可以创建 blockquote。

---

## 属性

现在，我们来仔细看看插件的每个部分。

### id

> `string`

首先，我们定义了插件的`id`。
这个 id 应该是每个插件的唯一标识。
它被用于在编辑器中标识插件。

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

Schema 是 prosemirror schema 的超集。
对于`createNode`工厂，它是[prosemirror node schema spec](https://prosemirror.net/docs/ref/#model.NodeSpec)的超集。
对于`createMark`工厂，它是[prosemirror mark schema spec](https://prosemirror.net/docs/ref/#model.MarkSpec)的超集。

对于`createPlugin`工厂，你可以创建多个 node 和 mark。例如：

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

如果你不熟悉 prosemirror，我非常建议你阅读 node 和 mark 在 prosemirror 中的定义，以确保你能够理解接下来的内容。

这里每个 schema 都用于定义 node 或 mark 的结构，它主要包含 3 部分属性：

1. `parseDOM`和`toDOM`：这是用来定义如何将 node/mark 从 DOM 中解析和渲染到 DOM 中。与 prosemirror node/mark spec 的定义方式相同。
2. `parseMarkdown`和`toMarkdown`：这是用来定义如何将 node/mark 从 markdown AST 中解析和渲染到 markdown AST 中。这是 milkdown 中特有的属性。
3. 其它属性：这用于定义 node/mark 的行为，与 prosemirror node/mark spec 中的任何属性都可以放在这里。

#### SchemaType

对于每个插件工厂，都会有一个 SchemaType，由 schema 的定义来决定。
对于`createNode`是`NodeSchema`。
对于`createMark`是`MarkSchema`。
对于`createPlugin`，是一个对象。

例如，我们在上面定义的`myPlugin`将会有这个 schema 类型：

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

SchemaType 可能会被用在插件工厂的以下其它属性中：

-   [commands](#commands)
-   [inputRules](#inputrules)
-   [prosePlugins](#proseplugins)

### commands

> `type commands = (type: SchemaType, ctx: Ctx) => Commands[]`

你可以添加 commands 来让编辑器的其它部分来使用它。
例如，我们想要其它组件例如菜单栏或者下拉列表可以创建一个 blockquote。我们可以添加一个 command 名为`WrapInBlockquote`。
然后其它的组件就只需要直接调用`WrapInBlockquote`命令来创建一个 blockquote，而不需要知道具体的细节。

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

关于 commands 的更多详情，请参见[commands](/zh-hans/commands)。

### inputRules

> `(schemaType: SchemaType, ctx: Ctx) => InputRule[]`

这个属性被用于定义当用户输入怎样的字符时，将会触发目标命令。例如，我们期望用户可以通过输入`>`和一个空格来创建一个 blockquote。

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

InputRules 是 prosemirror 的一部分，如果你想要更多的详情或创建你自己的 inputrules，
请参见[prosemirror-inputrules](https://prosemirror.net/docs/ref/#inputrules)。

### prosePlugins

> `(schemaType: SchemaType, ctx: Ctx) => ProsemirrorPlugin[]`

这个属性被用于定义[prosemirror 插件](https://prosemirror.net/docs/ref/#state.Plugin_System)。
Prosemirror 插件可以用来扩展编辑器的行为。
例如添加 tooltip 或者 placeholder。

### shortcuts

> `Record<string, Shortcut>`

Shortcuts 用来定义用户输入的组合键能够出发怎样的命令。
例如，我们期望用户可以通过输入`Mode-Shift-b`来创建一个 blockquote。

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

这里我们定义了一个快捷键，当用户输入`Mod-Shift-b`时，命令`WrapInBlockquote`将被触发。

#### 自定义快捷键

使用 shortcuts 的好处是，当其他用户使用你的插件时，他们可以自定义快捷键。

```typescript
const blockquoteWithUserDefinedShortcut = blockquote({
    keymap: {
        Blockquote: 'Mod-Alt-b',
    },
});
```

这里用户可以输入`Mod-Alt-b`来创建一个 blockquote，而不是使用原来的快捷键。

### view

> `(ctx: Ctx) => ViewFactory`

这个属性被用来定义[node view](https://prosemirror.net/docs/ref/#view.NodeView)。
它为你提供了一种控制渲染出的 DOM 的方式。
它比起 schema 中的`toDOM`更加复杂，但是更加强大。

### remarkPlugin

> `(ctx: Ctx) => RemarkPlugin[]`

这个属性用于定义[remark 插件](https://github.com/remarkjs/remark/blob/main/doc/plugins.md)。
它用于扩展解析器和序列化器的行为。
大多数时候如果想要定义自己的 markdown 语法，都需要使用 remark 插件。

---

## 注入 Slice

有时候你可能会想在插件中注入一些 slice，来让他们可以被编辑器的其他部分更新和访问。

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

## 样式

如果你的插件有用户界面，你可能想要为他们添加样式。
我们提供了一些工具来帮助你做到这一点。
你可以通过插件工厂的第一个参数获取到它们。

### getStyle

> `(callback: (emotion: Emotion) => string | undefined) => void`

函数`getStyle`被用于通过一个回调函数来创建样式。
这里的`Emotion`和[emotion 库](https://emotion.sh/docs/@emotion/css)中的是一样的。

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

我们需要使用`getStyle`来创建样式的原因是，我们可以通过这种方式来让插件自动支持[无头模式](/zh-hans/styling#headless-mode)。
在无头模式中，所有通过`getStyle`创建的样式都会被擦除。
用户可以通过以下方法来开启无头模式：

```typescript
const headlessBlockquote = blockquote({
    headless: true,
});
```

你可能也注意到了我们把样式放在了`themeManager.onFlush`中，这是为了在主题更改时刷新样式。

### getClassName

> `(attrs: Attrs, ...defaultValue: (string | null | undefined)[]) => string`

函数`getClassName`被用于通过一个回调函数来创建一个或多个 class 类名。

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

通过以上代码，blockquote 将会有 class `blockquote`和`milkdown-blockquote`。
这还带来了一个好处，那就是我们可以让用户[自己决定 class 的名字](/zh-hans/styling#option-2:-add-custom-class-name)。
这里是一个例子：

```typescript
const blockquoteWithCustomClassName = blockquote({
    className: (attrs) => 'custom-blockquote',
});
```

---

## 选项

一些插件可能会想要用户来配置一些选项。例如，一个有文字的插件可能会想要用户来决定文字的内容来做到本地化。

你可以通过第二个参数来得到用户传入的选项。

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

需要注意的是，所有的选项都应该被认为是**可选的。**
也就是说如果用户选择不传递任何选项，你最好为他们都设置合适的默认值。

## 继承

被工厂创建的插件可以被继承。
如果你只是想要修改一个现存插件的一些部分，继承要比重新写一个简单得多。

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

这里我们有 3 个参数。
`options`和`utils`已经介绍过了。
`original`是要被继承的插件的原始声明。
继承方法应该总是返回一个新的插件。

## AtomList

In a complex real world app, we may want to create a list of plugins.
Let users `use` them one by one might be a little bit complicated.
So we provide a utility to create a list of plugins.
With this list, users can use, extend and configure them easily.
在一个真实世界的复杂应用中，我们可能需要创建一系列插件。
如果让用户一个一个的对他们调用`use`可能会有一点复杂。
所以我们提供了一个工具来创建一个插件列表。
通过这个列表，用户可以轻松的使用，继承和配置它们。

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

## 现实示例

在 Milkdown 中，大多数插件都是通过插件工厂来定义的。

你可以查看 [preset-commonmark](https://github.com/Saul-Mirone/milkdown/tree/main/packages/preset-commonmark/src) 的源代码来看看我们是如何使用插件工厂的。
