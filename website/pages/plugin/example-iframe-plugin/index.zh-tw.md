# 範例：iframe 插件

一般而言，如果我們想添加一个自定義語法插件，需要完成以下 5 個步驟：

1. 新增一個 remark 插件來確保我們的語法可以正確的被解析和序列化。
2. 為自定義語法新增一個 prosemirror schema。
3. 編寫一個解析器聲明來將 remark AST 轉換到 prosemirror 節點。
4. 編寫一個序列化器聲明來將 prosemirror 節點轉換到 remark AST。
5. 編寫一個 prosemirror 輸入規則（input rule）來確保使用者的輸入可以被正確的轉換為對應的 prosemirror 節點。

---

在這一節中，我們將新增一個**自定義 iframe 語法**來將 iframe 作為一種節點新增進 markdown。

## Remark 插件

首先，我們需要一個 remark 插件來支援我們的自定義語法。
幸運的是，remark 提供了一個強大的 [directive 插件](https://github.com/remarkjs/remark-directive) 來支援自定義語法。通過這個插件，我們可以輕易的通過以下語法定義一個 iframe：

```markdown
# My Iframe

:iframe{src="https://saul-mirone.github.io"}
```

所以，我們需要的只是安裝它並將其轉換為一個 milkdown 插件：

```typescript
import { RemarkPlugin } from '@milkdown/core';
import directive from 'remark-directive';

const iframe = createNode(() => ({
    // ...
    remarkPlugins: () => [directive as RemarkPlugin],
}));
```

## 定義 Schema

接著，我們需要定義 iframe 節點的 schema。
我們把 iframe 定義為一個 inline 節點，因為它沒有任何的子節點，
並且有一個`src`標籤來連線到目標頁面。

```typescript
import { createNode } from '@milkdown/utils';

const id = 'iframe';
const iframe = createNode(() => ({
    id,
    schema: () => ({
        inline: true,
        attrs: {
            src: { default: null },
        },
        group: 'inline',
        marks: '',
        parseDOM: [
            {
                tag: 'iframe',
                getAttrs: (dom) => {
                    if (!(dom instanceof HTMLElement)) {
                        throw new Error();
                    }
                    return {
                        src: dom.getAttribute('src'),
                    };
                },
            },
        ],
        toDOM: (node) => ['iframe', { ...node.attrs, class: 'iframe' }, 0],
    }),
}));
```

## 解析器

接著，我們需要新增一個解析器聲明，來將 remark AST 轉換為 prosemirror node。
你可以使用開發者工具去檢查 remark AST 的結構。我們可以發現 iframe 具有以下結構：

```typescript
const AST = {
    name: 'iframe',
    attributes: { src: 'https://saul-mirone.github.io' },
    type: 'textDirective',
};
```

所以我們可以輕易寫出它對應的解析器聲明：

```typescript
schema: () => ({
    // ...
    parseMarkdown: {
        match: (node) => node.type === 'textDirective' && node.name === 'iframe',
        runner: (state, node, type) => {
            state.addNode(type, { src: (node.attributes as { src: string }).src });
        },
    },
}),
```

現在，`defaultValue` 中的文字可以被正確的解析為 iframe 元素了。

## 序列化器

接著，我們需要新增序列化器來將 prosemirror 節點轉回為 remark AST。

```typescript
schema: () => ({
    // ...
    toMarkdown: {
        match: (node) => node.type.name === id,
        runner: (state, node) => {
            state.addNode('textDirective', undefined, undefined, {
                name: 'iframe',
                attributes: {
                    src: node.attrs.src,
                },
            });
        },
    }
},
```

現在，iframe 元素可以被正確的序列化成 markdown 字串了。

## 輸入規則

我們也需要能夠讓使用者的輸入順利轉換為對應的 iframe。
我們可以使用 `inputRules` 來定義 [prosemirror 使用者輸入](https://prosemirror.net/docs/ref/#inputrules) 來實現這個功能：

```typescript
import { InputRule } from 'prosemirror-inputrules';

const iframe = createNode(() => ({
    // ...
    inputRules: (nodeType) => [
        new InputRule(/:iframe\{src\="(?<src>[^"]+)?"?\}/, (state, match, start, end) => {
            const [okay, src = ''] = match;
            const { tr } = state;
            if (okay) {
                tr.replaceWith(start, end, nodeType.create({ src }));
            }

            return tr;
        }),
    ],
}));
```

## 使用外掛

最後，我們只需要使用 `use` 來使用我們編寫的插件：

```typescript
import { Editor } from '@milkdown/core';
import { AtomList, createNode } from "@milkdown/utils";
import { commonmark } from '@milkdown/preset-commonmark';

const iframe = createNode(() => ({ /* ... */ });

const iframePlugin = AtomList.create([iframe()]);

Editor.make().use(iframePlugin).use(commonmark).create();
```

---

## 完整程式碼

!CodeSandBox{milkdown-custom-syntax-mudgd?fontsize=14&hidenavigation=1&theme=dark&view=preview}
