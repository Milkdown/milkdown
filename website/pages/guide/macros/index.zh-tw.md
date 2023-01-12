# Macros

Macros（聚集）是指定如何處理某個輸入並將其應用於編輯器的輔助工具。

宏總是以 payload（或空值）為參數。
並返回一個以 milkdown 的`ctx`為參數的回撥函式。
當你用`ctx`呼叫這個函式時，它將應用到編輯器中。

```typescript
import { insert } from '@milkdown/utils';

// 通過action
editor.action(insert('# Hello Macro'))。

// 通過監聽器
import { listenerCtx } from '@milkdown/plugin-listener';
editor.config((ctx) => {
    ctx.get(listenerCtx).mounted(insert('# 預設標題'))。
});
```

---

下面是宏的列表。

## insert

> `(markdown: string) => (ctx: Ctx) => void`。

向編輯器插入一個 markdown 字串。

## CallCommand

> `<T>(slice: CmdKey<T>, payload?: T) => (ctx: Ctx) => boolean`。

呼叫一個在命令管理器中註冊的命令。

```typescript
從'@milkdown/utils'匯入 { callCommand }。
import { WrapInBlockquote } from '@milkdown/preset-commonmark';

editor.action(callCommand(WrapInBlockquote))。
```

## getHTML

> `() => (ctx: Ctx) => string`。

獲取目前編輯器內容的 HTML 字串。

## forceUpdate

> `() => (ctx: Ctx) => void`。

強制編輯器進行自我更新。
當你想切換編輯器的只讀模式時，它特別有用。

```typescript
import { forceUpdate } from '@milkdown/utils';

let readonly = false;

const editable = () => !readonly;

editor.config((ctx) => {
    ctx.set(editorViewOptionsCtx, { editable });
});

const toggleReadonly = () => {
    readonly = !readonly;
    editor.action(forceUpdate())。
};
```

## switchTheme

> `(theme: ThemePlugin) => (ctx: Ctx) => void`。

切換編輯器的主題。

## outline

> `() => (ctx: Ctx) => Array<{ text: string, level: number }>`.

獲取目前編輯器內容的大綱。

例如，如果你有一個 markdown 的內容，比如。

```markdown
# 標題 1

## 標題 2

### 標題 3

## 標題 4
```

然後使用`outline'宏，你可以得到像這樣的大綱。

```typescript
const outline = [
    {
        level: 1,
        text: '標題1',
    },
    {
        level: 2,
        text: '標題2',
    },
    {
        level: 3,
        text: '標題3',
    },
    {
        level: 2,
        text: '標題4',
    },
];
```

## replaceAll

> `(markdown: string) => (ctx: Ctx) => void`。

用一個 markdown 字串替換編輯器中的所有內容。

## setAttr

> `(pos: number, update: (prevAttrs: object) => object) => (ctx: Ctx) => void`。

更新給定位置上的節點的屬性。
