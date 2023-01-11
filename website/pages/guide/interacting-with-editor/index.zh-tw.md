# 與編輯器互動

## DOM 節點的註冊

預設情況下，Milkdown 會基於 document.body 建立一個編輯器。當然你也可以通過下面方法來指定要掛載編輯器的 DOM 節點：

```typescript
import { rootCtx } from '@milkdown/core';

Editor.make().config((ctx) => {
    ctx.set(rootCtx, document.querySelector('#editor'));
});
```

## 編輯器預設值型別的設定

### Markdown

你可以設定符合 Markdown 語法的字串作為編輯器的預設值型別。

```typescript
import { defaultValueCtx } from '@milkdown/core';

const defaultValue = '# Hello milkdown';
Editor.make().config((ctx) => {
    ctx.set(defaultValueCtx, defaultValue);
});
```

接著，編輯器將會對預設值進行相應渲染。

### Dom 節點

你也可以通過使用 HTML 作為編輯器的預設值型別。

假設我們編寫了下面的一段 HTML 程式碼：

```html
<div id="pre">
    <h1>Hello milkdown!</h1>
</div>
```

緊接著，我們需要明確預設值的型別為 HTML，進行編輯器的渲染配置：

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

你也可以使用 JSON 對像作為預設值。

這個 JSON 對象可以通過監聽器 [listener-plugin](https://www.npmjs.com/package/@milkdown/plugin-listener) 進行獲取，例如：

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

接著，我們可以使用獲取到的 `jsonOutput` 作為編輯器的預設值配置：

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

## 新增監聽器

正如上半部分所提到的那樣，你可以通過在編輯器新增監聽器，來獲取你所需要的值。

這裡監聽器分為以下兩種：

### Markdown 監聽器

你可以新增 Markdown 監聽器來獲取你需要的 markdown 字串的輸出。

你可以新增任意多個監聽器，所有的監聽器將會一次改動中被觸發。

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

### Doc 監聽器

你也可以通过监听 [raw prosemirror document node](https://prosemirror.net/docs/ref/#model.Node)，來進行功能的實現。

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

## 只讀模式

你可以通過設定 `editable` 屬性來設定編輯器是否只讀

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

你可以通過使用 Action 來獲取編輯器執行時的上下文。

例如，通過 Action 獲取 Markdown 字串：

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

我們提供了一些開箱即用的 macro（聚集），你可以把它們作為 action 使用：

```typescript
import { insert } from '@milkdown/utils';

editor.action(insert('# Hello milkdown'));
```

關於 macro 的更多細節，請參考 [macro](/zh-tw/macros)。
