# 例子：iframe 插件

一般而言，如果我们想添加一个自定义语法插件，需要完成以下 5 个步骤：

1. 添加一个 remark 插件来确保我们的语法可以正确的被解析和序列化。
2. 为自定义语法添加一个 prosemirror schema。
3. 编写一个解析器声明来将 remark AST 转换到 prosemirror 节点。
4. 编写一个序列化器声明来将 prosemirror 节点转换到 remark AST。
5. 编写一个 prosemirror 输入规则（input rule）来确保用户的输入可以被正确的转换为对应的 prosemirror 节点。

---

在这一节中，我们将添加一个**自定义 iframe 语法**来将 iframe 作为一种节点添加进 markdown。

## Remark 插件

首先，我们需要一个 remark 插件来支持我们的自定义语法。
幸运的是，remark 提供了一个强大的 [directive 插件](https://github.com/remarkjs/remark-directive) 来支持自定义语法。通过这个插件，我们可以轻易的通过以下语法定义一个 iframe：

```markdown
# My Iframe

:iframe{src="https://saul-mirone.github.io"}
```

所以，我们需要的只是安装它并将其转换为一个 milkdown 插件：

```typescript
import { RemarkPlugin } from '@milkdown/core';
import directive from 'remark-directive';

const iframe = createNode(() => ({
    // ...
    remarkPlugins: () => [directive as RemarkPlugin],
}));
```

## 定义 Schema

接着，我们需要定义 iframe 节点的 schema。
我们把 iframe 定义为一个 inline 节点，因为它没有任何的子节点，
并且有一个`src`标签来连接到目标页面。

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

接着，我们需要添加一个解析器声明，来将 remark AST 转换为 prosemirror node。
你可以使用开发者工具去检查 remark AST 的结构。我们可以发现 iframe 具有以下结构：

```typescript
const AST = {
    name: 'iframe',
    attributes: { src: 'https://saul-mirone.github.io' },
    type: 'textDirective',
};
```

所以我们可以轻易写出它对应的解析器声明：

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

现在，`defaultValue` 中的文本可以被正确的解析为 iframe 元素了。

## 序列化器

接着，我们需要添加序列化器来将 prosemirror 节点转回为 remark AST。

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

现在，iframe 元素可以被正确的序列化成 markdown 字符串了。

## 输入规则

我们也需要能够让用户的输入顺利转换为对应的 iframe。
我们可以使用 `inputRules` 来定义 [prosemirror 用户输入](https://prosemirror.net/docs/ref/#inputrules) 来实现这个功能：

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

## 使用插件

最后，我们只需要使用 `use` 来使用我们编写的插件：

```typescript
import { Editor } from '@milkdown/core';
import { AtomList, createNode } from "@milkdown/utils";
import { commonmark } from '@milkdown/preset-commonmark';

const iframe = createNode(() => ({ /* ... */ });

const iframePlugin = AtomList.create([iframe()]);

Editor.make().use(iframePlugin).use(commonmark).create();
```

---

## 完整代码

!CodeSandBox{milkdown-custom-syntax-mudgd?fontsize=14&hidenavigation=1&theme=dark&view=preview}
