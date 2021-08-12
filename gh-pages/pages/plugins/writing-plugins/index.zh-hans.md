# 编写插件

你也可以自己编写 Milkdown 插件而不使用提供的工具。通过这种方式，你将能够控制更多插件的细节。这有助于帮助你编写出更强大的插件。

## 结构概览

一般来说，一个插件具有如下结构：

```typescript
import { MilkdownPlugin } from '@milkdown/core';

const myPlugin: MilkdownPlugin = (pre) => {
    // #1 准备阶段
    return async (ctx) => {
        // #2 执行阶段
    };
};
```

每个插件由两部分组成：

1. _准备_: 这一阶段将在插件被通过 `use` 方法被注册进 milkdown 时执行。
2. _执行_: 这一阶段将在插件被真实加载时执行。

## 定时器（Timer）

定时器被用于决定当前插件被加载的时机，和当前插件将如何影响其它插件的加载。

你可以使用 `ctx.wait` 来等待一个定时器结束。

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

你也可以创建自己的定时器，以及影响其它插件的加载时机。
例如，让我创建一个插件，它将从远程服务器拉取编辑器的默认值。

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

它有如下几个步骤：

1. 我们使用 `createTimer` 来创建定时器，然后使用`pre.record`来将定时器注册到 milkdown 中。
2. 我们更新 `editorStateTimerCtx` 来告诉内置的 `editorState` 插件，它应该等我们的远程获取步骤结束后再执行。
3. 当我们从`fetchMarkdownAPI`中取到需要的数据后，我们将它设置为`defaultValue`并调用`ctx.done`来将定时器标记为结束。

## 上下文（Ctx）

在上个例子中，我们已经使用了 `ctx` 许多次了，现在让我们尝试去理解它是什么。
上下文是一个可以在整个编辑器实例中共享的数据切片。

```typescript
import { MilkdownPlugin, createCtx } from '@milkdown/core';

const counterCtx = createCtx(0);

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
    };
};
```

我们可以使用 `createCtx` 来创建上下文，然后使用 `pre.inject` 来将其注册到编辑器中。

当插件执行时，我们可以使用`ctx.get`来获取一个上下文的值，使用`ctx.set`来设置它的值，或是使用`ctx.update`来使用一个回调函数更新上下文。

所以当我们结合`timer`使用`ctx`时，我们可以决定一个插件执行的时机。

```typescript
import { MilkdownPlugin, SchemaReady, Timer, createCtx } from '@milkdown/core';

const examplePluginTimersCtx = createCtx<Timer[]>([]);

const examplePlugin: MilkdownPlugin = (pre) => {
    pre.inject(counterCtx, [SchemaReady]);
    return async (ctx) => {
        await Promise.all(ctx.get(examplePluginTimersCtx).map((timer) => ctx.wait(timer)));
        // 或者我们也可以用一个内置的语法糖简化它
        await ctx.waitTimers(examplePluginTimersCtx);

        // do something
    };
};
```

通过这种模式，如果其它插件想要延迟`examplePlugin`的执行，它们需要做的就是通过`ctx.update`添加一个定时器到`examplePluginTimerCtx`中。
