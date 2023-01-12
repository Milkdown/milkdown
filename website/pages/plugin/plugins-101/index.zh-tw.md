# 從 0 到 1 寫插件

在這個章節中，我將會介紹插件的基本資訊。
大多數情況下，你可以不用在沒有幫助函式的情況下編寫插件，但是它可以幫助你理解插件系統和插件的執行機制。

## 結構概覽

一般來說，插件將會有以下結構：

```typescript
import { MilkdownPlugin } from '@milkdown/core';

const myPlugin: MilkdownPlugin = (pre) => {
    // #1 準備階段
    return async (ctx) => {
        // #2 執行階段
    };
};
```

每一個插件都有兩個階段：

1. _準備階段_: 這個階段將會在插件被通過`use`方法註冊到 milkdown 中時執行。
2. _執行階段_: 這個階段將會在插件被載入時執行。

## 定時器

定時器可以用來決定當前插件的載入時間，和目前插件如何影響其他插件的載入狀態。

你可以使用 `ctx.wait` 方法來等待定時器完成。

```typescript
import { MilkdownPlugin, Complete } from '@milkdown/core';

const myPlugin: MilkdownPlugin = () => {
    return async (ctx) => {
        const start = Date.now();

        await ctx.wait(Complete);

        const end = Date.now();

        console.log('Milkdown load duration: ', end - start);
    };
};
```

你也可以建立你自己的定時器，並且影響其他插件的載入時機。
例如，我們將建立一個插件，它將會從遠端伺服器獲取編輯器的預設值。

```typescript
import { MilkdownPlugin, editorStateTimerCtx, defaultValueCtx, createTimer } from '@milkdown/core';

const RemoteTimer = createTimer('RemoteTimer');

const remotePlugin: MilkdownPlugin = (pre) => {
    pre.record(RemoteTimer);

    return async (ctx) => {
        ctx.update(editorStateTimerCtx, (timers) => timers.concat(RemoteTimer));

        const defaultMarkdown = await fetchMarkdownAPI();
        ctx.set(defaultValueCtx, defaultMarkdown);

        ctx.done(RemoteTimer);
    };
};
```

它有以下步驟：

1. 我們使用`createTimer`來建立一個定時器，並使用`pre.record`來將它註冊到 milkdown 中。
2. 我們更新`editorStateTimerCtx`來告訴內部的`editorState`插件，在初始化編輯器狀態之前，它應該等待我們的遠端載入完成。
3. 在我們獲取到值之後，我們將它設定為`defaultValue`，並使用`ctx.done`標記一個定時器為完成。

## Ctx

我們已經在之前的例子中使用了`ctx`，現在我們可以嘗試瞭解它的作用。
Ctx 是一塊可以在整個編輯器實例中共享的數據。

```typescript
import { MilkdownPlugin, createSlice } from '@milkdown/core';

const counterCtx = createSlice(0, 'counter');

const counterPlugin: MilkdownPlugin = (pre) => {
    pre.inject(counterCtx);

    return (ctx) => {
        // count is 0
        const count0 = ctx.get(counterCtx);

        // set count to 1
        ctx.set(counterCtx, 1);

        // now count is 1
        const count1 = ctx.get(counterCtx);

        // set count to n + 2
        ctx.update(counterCtx, (prev) => prev + 2);

        // now count is 3
        const count2 = ctx.get(counterCtx);
        // we can also get value by the slice name
        const count3 = ctx.get('counter');
    };
};
```

我們可以使用`createSlice`來建立一個 ctx，然後使用`pre.inject`來將它注入到編輯器中。

當插件執行時，`ctx.get`可以獲取一個 ctx 的值，`ctx.set`可以設定一個 ctx 的值，`ctx.update`可以使用回撥函式來更新一個 ctx。

所以，我們可以使用`ctx`和`timer`來決定插件應該何時被處理。

```typescript
import { MilkdownPlugin, SchemaReady, Timer, createSlice } from '@milkdown/core';

const examplePluginTimersCtx = createSlice<Timer[]>([], 'example-timer');

const examplePlugin: MilkdownPlugin = (pre) => {
    pre.inject(examplePluginTimersCtx, [SchemaReady]);
    return async (ctx) => {
        await Promise.all(ctx.get(examplePluginTimersCtx).map((timer) => ctx.wait(timer)));
        // or we can use a simplified syntax sugar
        await ctx.waitTimers(examplePluginTimersCtx);

        // do something
    };
};
```

通過這種模式，如果其它插件需要延遲`examplePlugin`的處理，那麼它們只需要使用`ctx.update`將一個定時器新增到`examplePluginTimersCtx`中即可。
