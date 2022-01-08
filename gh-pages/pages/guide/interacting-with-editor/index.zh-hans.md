# 与编辑器交互

## DOM 节点的注册

默认情况下，Milkdown 会基于 document.body 创建一个编辑器。当然你也可以通过下面方法来指定要挂载编辑器的 DOM 节点：

```typescript
import { rootCtx } from '@milkdown/core';

Editor.make().config((ctx) => {
    ctx.set(rootCtx, document.querySelector('#editor'));
});
```

## 编辑器默认值类型的设定

### Markdown

你可以设置符合 Markdown 语法的字符串作为编辑器的默认值类型。

```typescript
import { defaultValueCtx } from '@milkdown/core';

const defaultValue = '# Hello milkdown';
Editor.make().config((ctx) => {
    ctx.set(defaultValueCtx, defaultValue);
});
```

接着，编辑器将会对默认值进行相应渲染。

### Dom 节点

你也可以通过使用 HTML 作为编辑器的默认值类型。

假设我们编写了下面的一段 HTML 代码：

```html
<div id="pre">
    <h1>Hello milkdown!</h1>
</div>
```

紧接着，我们需要明确默认值的类型为 HTML，进行编辑器的渲染配置：

```typescript
import { defaultValueCtx } from '@milkdown/core';

const defaultValue = {
    type: 'html',
    dom: document.querySelector('#pre'),
};
Editor.make().config((ctx) => {
    ctx.set(defaultValueCtx, defaultValue);
});
```

### JSON

你也可以使用 JSON 对象作为默认值。

这个 JSON 对象可以通过监听器 [listener-plugin](https://www.npmjs.com/package/@milkdown/plugin-listener) 进行获取，例如：

```typescript
import { listener, listenerCtx } from '@milkdown/plugin-listener';

let jsonOutput;

Editor.make()
    .config((ctx) => {
        ctx.get(listenerCtx).updated((ctx, doc, prevDoc) => {
            jsonOutput = doc.toJSON();
        });
    })
    .use(listener);
```

接着，我们可以使用获取到的 `jsonOutput` 作为编辑器的默认值配置：

```typescript
import { defaultValueCtx } from '@milkdown/core';

const defaultValue = {
    type: 'json',
    value: jsonOutput,
};
Editor.make().config((ctx) => {
    ctx.set(defaultValueCtx, defaultValue);
});
```

---

## 添加监听器

正如上半部分所提到的那样，你可以通过在编辑器添加监听器，来获取你所需要的值。

这里监听器分为以下两种：

### Markdown 监听器

你可以添加 Markdown 监听器来获取你需要的 markdown 字符串的输出。

你可以添加任意多个监听器，所有的监听器将会一次改动中被触发。

```typescript
import { listener, listenerCtx } from '@milkdown/plugin-listener';

let output = '';

Editor.make()
    .config((ctx) => {
        ctx.get(listenerCtx).markdownUpdated((ctx, markdown, prevMarkdown) => {
            output = markdown;
        });
    })
    .use(listener);
```

### Doc 监听器

你也可以通过监听 [raw prosemirror document node](https://prosemirror.net/docs/ref/#model.Node)，来进行功能的实现。

```typescript
import { listener, listenerCtx } from '@milkdown/plugin-listener';

let jsonOutput;

Editor.make()
    .config((ctx) => {
        ctx.get(listenerCtx).updated((ctx, doc, prevDoc) => {
            jsonOutput = doc.toJSON();
        });
    })
    .use(listener);
```

---

## 只读模式

你可以通过设定 `editable` 属性来设置编辑器是否只读

```typescript
import { editorViewOptionsCtx } from '@milkdown/core';

let readonly = false;

const editable = () => !readonly;

Editor.make().config((ctx) => {
    ctx.set(editorViewOptionsCtx, { editable });
});

// set to readonly after 5 secs.
setTimeout(() => {
    readonly = true;
}, 5000);
```

---

## 使用 Action

你可以通过使用 Action 来获取编辑器运行时的上下文。

例如，通过 Action 获取 Markdown 字符串：

```typescript
import { Editor, editorViewCtx, serializerCtx } from '@milkdown/core';

async function playWithEditor() {
    const editor = await Editor.make().use(commonmark).create();

    const getMarkdown = () =>
        editor.action((ctx) => {
            const editorView = ctx.get(editorViewCtx);
            const serializer = ctx.get(serializerCtx);
            return serializer(editorView.state.doc);
        });

    // get markdown string:
    getMarkdown();
}
```
