# 从 0 到 1 写插件

在这个章节中，我将会介绍插件的基本信息。
大多数情况下，你可以不用在没有帮助函数的情况下编写插件，但是它可以帮助你理解插件系统和插件的运行机制。

## 结构概览

一般来说，插件将会有以下结构：

```typescript
import { MilkdownPlugin } from '@milkdown/core';

const myPlugin: MilkdownPlugin = (pre) => {
    // #1 准备阶段
    return async (ctx) => {
        // #2 运行阶段
    };
};
```

每一个插件都有两个阶段：

1. _准备阶段_: 这个阶段将会在插件被通过`use`方法注册到 milkdown 中时执行。
2. _运行阶段_: 这个阶段将会在插件被加载时执行。

## 定时器

定时器可以用来决定当前插件的加载时间，和当前插件如何影响其他插件的加载状态。

你可以使用 `ctx.wait` 方法来等待定时器完成。

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

你也可以创建你自己的定时器，并且影响其他插件的加载时机。
例如，我们将创建一个插件，它将会从远程服务器获取编辑器的默认值。

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

It has following steps:
它有以下步骤：

1. 我们使用`createTimer`来创建一个定时器，并使用`pre.record`来将它注册到 milkdown 中。
2. 我们更新`editorStateTimerCtx`来告诉内部的`editorState`插件，在初始化编辑器状态之前，它应该等待我们的远程加载完成。
3. 在我们获取到值之后，我们将它设置为`defaultValue`，并使用`ctx.done`标记一个定时器为完成。

## Ctx

我们已经在之前的例子中使用了`ctx`，现在我们可以尝试了解它的作用。
Ctx 是一块可以在整个编辑器实例中共享的数据。

```typescript
import { MilkdownPlugin, createSlice } from '@milkdown/core';

const counterCtx = createSlice(0, 'counter');

const counterPlugin: MilkdownPlugin = (pre) => {
    pre.inject(counterCtx);

    return (ctx) => {
        // count is 0
        const count0 = ctx.get(counterCtx);

        // set count to 1
        ctx.get(counterCtx, 1);

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

我们可以使用`createSlice`来创建一个 ctx，然后使用`pre.inject`来将它注入到编辑器中。

当插件运行时，`ctx.get`可以获取一个 ctx 的值，`ctx.set`可以设置一个 ctx 的值，`ctx.update`可以使用回调函数来更新一个 ctx。

所以，我们可以使用`ctx`和`timer`来决定插件应该何时被处理。

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

With this pattern, if other plugins want to delay the process of `examplePlugin`, all they need to do is just add a timer into `examplePluginTimersCtx` with `ctx.update`.
通过这种模式，如果其它插件需要延迟`examplePlugin`的处理，那么它们只需要使用`ctx.update`将一个定时器添加到`examplePluginTimersCtx`中即可。
