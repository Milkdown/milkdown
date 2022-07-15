# Macros

Macros（宏）是指定如何处理某个输入并将其应用于编辑器的辅助工具。

宏总是以 payload（或空值）为参数。
并返回一个以 milkdown 的`ctx`为参数的回调函数。
当你用`ctx`调用这个函数时，它将应用到编辑器中。

```typescript
import { insert } from '@milkdown/utils';

// 通过action
editor.action(insert('# Hello Macro'))。

// 通过监听器
import { listenerCtx } from '@milkdown/plugin-listener';
editor.config((ctx) => {
    ctx.get(listenerCtx).mounted(insert('# 默认标题'))。
});
```

---

下面是宏的列表。

## insert

> `(markdown: string) => (ctx: Ctx) => void`。

向编辑器插入一个 markdown 字符串。

## CallCommand

> `<T>(slice: CmdKey<T>, payload?: T) => (ctx: Ctx) => boolean`。

调用一个在命令管理器中注册的命令。

```typescript
从'@milkdown/utils'导入 { callCommand }。
import { WrapInBlockquote } from '@milkdown/preset-commonmark';

editor.action(callCommand(WrapInBlockquote))。
```

## getHTML

> `() => (ctx: Ctx) => string`。

获取当前编辑器内容的 HTML 字符串。

## forceUpdate

> `() => (ctx: Ctx) => void`。

强制编辑器进行自我更新。
当你想切换编辑器的只读模式时，它特别有用。

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

切换编辑器的主题。

## outline

> `() => (ctx: Ctx) => Array<{ text: string, level: number }>`.

获取当前编辑器内容的大纲。

例如，如果你有一个 markdown 的内容，比如。

```markdown
# 标题 1

## 标题 2

### 标题 3

## 标题 4
```

然后使用`outline'宏，你可以得到像这样的大纲。

```typescript
const outline = [
    {
        level: 1,
        text: '标题1',
    },
    {
        level: 2,
        text: '标题2',
    },
    {
        level: 3,
        text: '标题3',
    },
    {
        level: 2,
        text: '标题4',
    },
];
```

## replaceAll

> `(markdown: string) => (ctx: Ctx) => void`。

用一个 markdown 字符串替换编辑器中的所有内容。

## setAttr

> `(pos: number, update: (prevAttrs: object) => object) => (ctx: Ctx) => void`。

更新给定位置上的节点的属性。
