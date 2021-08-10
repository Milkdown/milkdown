# Writing Plugins

Instead of using provided utils to create plugin, you can also write plugin yourself.
You will get more access to the plugin detail in this way. And this could help you to write yourself a powerful plugin.

## Structure Overview

Generally, a plugin will have following structure:

```typescript
import { MilkdownPlugin } from '@milkdown/core';

const myPlugin: MilkdownPlugin = (pre) => {
    // #1 prepare plugin
    return async (ctx) => {
        // #2 run plugin
    };
};
```

Each plugin has two parts:

1. _Prepare_: this part will be executed when plugin is registered in milkdown by `.use` method.
2. _Run_: this part will be executed when plugin is actually loaded.

## Timer

Timer can be used to decide when to load the current plugin and how current plugin can influence other plugin's load.

You can use `ctx.wait` to wait a timer finish.

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

You can also create your own timer and influence other plugin's load time.
For example, let's create a plugin that will fetch markdown content from remote server as editor's default value.

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

1. We use `createTimer` to create a timer, and use `pre.record` to register it into the plugin.
2. We update `editorStateTimerCtx` to tell the internal `editorState` plugin that before initialize editor state, it should wait our remote fetch process finished.
3. After we get value from API, we set it as defaultValue and use `ctx.done` to mark a timer as complete.

## Ctx

We have used `ctx` several times in the above example, now we can understand what it is.
Ctx is a piece of data that can be shared in the entire editor instance.

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

We can use `createCtx` to create a ctx, and use `pre.inject` to inject the ctx into the editor.

And when plugin processing, `ctx.get` can get the value of a ctx, `ctx.set` can set the value of a ctx, and `ctx.update` can update a ctx using callback function.

So, we can use `ctx` combine with `timer` to decide when should a plugin be processed.

```typescript
import { MilkdownPlugin, SchemaReady, Timer, createCtx } from '@milkdown/core';

const examplePluginTimersCtx = createCtx<Timer[]>([]);

const examplePlugin: MilkdownPlugin = (pre) => {
    pre.inject(counterCtx, [SchemaReady]);
    return async (ctx) => {
        await Promise.all(ctx.get(examplePluginTimersCtx).map((timer) => ctx.wait(timer)));
        // or we can use a simplified syntax sugar
        await ctx.waitTimers(examplePluginTimersCtx);

        // do something
    };
};
```

With this pattern, if other plugins want to delay the process of `examplePlugin`, all they need to do is just add a timer into `examplePluginTimersCtx` with `ctx.update`.
