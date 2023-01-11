# 模組工廠

在[上一章](/zh-tw/plugins-101).我們展示瞭如何不借助任何工具建立一個模組。
幸運的是，我們大多數情況下不需要從零開始。我們可以使用模組工廠和[可組合模組](/zh-tw/composable-plugins)來建立模組。

我們提供 3 種方式來建立不同型別的模組：

-   createNode
-   createMark
-   createPlugin

## 概覽

對於每個模組工廠，它都會接受一個函式，返回一個模組建立函式。

讓我們建立一個簡單的 blockquote 模組。

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

通過這個模組，我們可以建立 blockquote。

---

## 屬性

現在，我們來仔細看看模組的每個部分。

### id

> `string`

首先，我們定義了模組的`id`。
這個 id 應該是每個模組的唯一標識。
它被用於在編輯器中標識模組。

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
對於`createNode`工廠，它是[prosemirror node schema spec](https://prosemirror.net/docs/ref/#model.NodeSpec)的超集。
對於`createMark`工廠，它是[prosemirror mark schema spec](https://prosemirror.net/docs/ref/#model.MarkSpec)的超集。

對於`createPlugin`工廠，你可以建立多個 node 和 mark。例如：

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

如果你不熟悉 prosemirror，我非常建議你閱讀 node 和 mark 在 prosemirror 中的定義，以確保你能夠理解接下來的內容。

這裡每個 schema 都用於定義 node 或 mark 的結構，它主要包含 3 部分屬性：

1. `parseDOM`和`toDOM`：這是用來定義如何將 node/mark 從 DOM 中解析和渲染到 DOM 中。與 prosemirror node/mark spec 的定義方式相同。
2. `parseMarkdown`和`toMarkdown`：這是用來定義如何將 node/mark 從 markdown AST 中解析和渲染到 markdown AST 中。這是 milkdown 中特有的屬性。
3. 其它屬性：這用於定義 node/mark 的行為，與 prosemirror node/mark spec 中的任何屬性都可以放在這裡。

#### SchemaType

對於每個模組工廠，都會有一個 SchemaType，由 schema 的定義來決定。
對於`createNode`是`NodeSchema`。
對於`createMark`是`MarkSchema`。
對於`createPlugin`，是一個對象。

例如，我們在上面定義的`myPlugin`將會有這個 schema 型別：

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

SchemaType 可能會被用在模組工廠的以下其它屬性中：

-   [commands](#commands)
-   [inputRules](#inputrules)
-   [prosePlugins](#proseplugins)

### commands

> `type commands = (type: SchemaType, ctx: Ctx) => Commands[]`

你可以新增 commands 來讓編輯器的其它部分來使用它。
例如，我們想要其它元件例如菜單欄或者下拉選單可以建立一個 blockquote。我們可以新增一個 command 名為`WrapInBlockquote`。
然後其它的元件就只需要直接呼叫`WrapInBlockquote`命令來建立一個 blockquote，而不需要知道具體的細節。

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

關於 commands 的更多詳情，請參見[commands](/zh-tw/commands)。

### inputRules

> `(schemaType: SchemaType, ctx: Ctx) => InputRule[]`

這個屬性被用於定義當用戶輸入怎樣的字元時，將會觸發目標命令。例如，我們期望使用者可以通過輸入`>`和一個空格來建立一個 blockquote。

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

InputRules 是 prosemirror 的一部分，如果你想要更多的詳情或建立你自己的 inputrules，
請參見[prosemirror-inputrules](https://prosemirror.net/docs/ref/#inputrules)。

### prosePlugins

> `(schemaType: SchemaType, ctx: Ctx) => ProsemirrorPlugin[]`

這個屬性被用於定義[prosemirror 模組](https://prosemirror.net/docs/ref/#state.Plugin_System)。
Prosemirror 模組可以用來擴充套件編輯器的行為。
例如新增 tooltip 或者 placeholder。

### shortcuts

> `Record<string, Shortcut>`

Shortcuts 用來定義使用者輸入的組合鍵能夠出發怎樣的命令。
例如，我們期望使用者可以通過輸入`Mode-Shift-b`來建立一個 blockquote。

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

這裡我們定義了一個快捷鍵，當用戶輸入`Mod-Shift-b`時，命令`WrapInBlockquote`將被觸發。

#### 自定义快捷键

使用 shortcuts 的好處是，當其他使用者使用你的模組時，他們可以自定義快捷鍵。

```typescript
const blockquoteWithUserDefinedShortcut = blockquote({
    keymap: {
        Blockquote: 'Mod-Alt-b',
    },
});
```

這裡使用者可以輸入`Mod-Alt-b`來建立一個 blockquote，而不是使用原來的快捷鍵。

### view

> `(ctx: Ctx) => ViewFactory`

這個屬性被用來定義[node view](https://prosemirror.net/docs/ref/#view.NodeView)。
它為你提供了一種控制渲染出的 DOM 的方式。
它比起 schema 中的`toDOM`更加複雜，但是更加強大。

### remarkPlugin

> `(ctx: Ctx) => RemarkPlugin[]`

這個屬性用於定義[remark 模組](https://github.com/remarkjs/remark/blob/main/doc/plugins.md)。
它用於模組解析器和序列化器的行為。
大多數時候如果想要定義自己的 markdown 語法，都需要使用 remark 模組。

---

## 注入 Slice

有時候你可能會想在模組中注入一些 slice，來讓他們可以被編輯器的其他部分更新和訪問。

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

## 樣式

如果你的模組有用戶界面，你可能想要為他們新增樣式。
我們提供了一些工具來幫助你做到這一點。
你可以通過模組工廠的第一個參數獲取到它們。

### getStyle

> `(callback: (emotion: Emotion) => string | undefined) => void`

函式`getStyle`被用於通過一個回撥函式來建立樣式。
這裡的`Emotion`和[emotion 庫](https://emotion.sh/docs/@emotion/css)中的是一樣的。

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

我們需要使用`getStyle`來建立樣式的原因是，我們可以通過這種方式來讓模組自動支援[無頭模式](/zh-tw/styling#headless-mode)。
在無頭模式中，所有通過`getStyle`建立的樣式都會被擦除。
使用者可以通過以下方法來開啟無頭模式：

```typescript
const headlessBlockquote = blockquote({
    headless: true,
});
```

你可能也注意到了我們把樣式放在了`themeManager.onFlush`中，這是爲了在主題更改時重新整理樣式。

### getClassName

> `(attrs: Attrs, ...defaultValue: (string | null | undefined)[]) => string`

函式`getClassName`被用於通過一個回撥函式來建立一個或多個 class 類名。

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

通過以上程式碼，blockquote 將會有 class `blockquote`和`milkdown-blockquote`。
這還帶來了一個好處，那就是我們可以讓使用者[自己決定 class 的名字](/zh-hans/styling#option-2:-add-custom-class-name)。
這裡是一個例子：

```typescript
const blockquoteWithCustomClassName = blockquote({
    className: (attrs) => 'custom-blockquote',
});
```

---

## 選項

一些模組可能會想要使用者來配置一些選項。例如，一個有文字的模組可能會想要使用者來決定文字的內容來做到本地化。

你可以通過第二個參數來得到使用者傳入的選項。

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

需要注意的是，所有的選項都應該被認為是**可選的。**
也就是說如果使用者選擇不傳遞任何選項，你最好為他們都設定合適的預設值。

## 繼承

被工廠建立的模組可以被繼承。
如果你只是想要修改一個現存模組的一些部分，繼承要比重新寫一個簡單得多。

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

這裡我們有 3 個參數。
`options`和`utils`已經介紹過了。
`original`是要被繼承的模組的原始聲明。
繼承方法應該總是返回一個新的模組。

## AtomList

在一個真實世界的複雜應用中，我們可能需要建立一系列模組。
如果讓使用者一個一個的對他們呼叫`use`可能會有一點複雜。
所以我們提供了一個工具來建立一個模組列表。
通過這個列表，使用者可以輕鬆的使用，繼承和配置它們。

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

## 現實示例

在 Milkdown 中，大多數模組都是通過模組工廠來定義的。

你可以查看 [preset-commonmark](https://github.com/Saul-Mirone/milkdown/tree/main/packages/preset-commonmark/src) 的原始碼來看看我們是如何使用模組工廠的。
