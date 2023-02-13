# Plugins 101

In this section we will show you the basic information of the plugin.
In most cases, you will not need to write plugins without helpers.
But it can help you understand the plugin system and what happens under the hood.

## Structure Overview

Generally speaking, a plugin will have following structure:

```typescript
import { MilkdownPlugin } from '@milkdown/core';

const myPlugin: MilkdownPlugin = (ctx) => {
  // #1 prepare plugin
  return async () => {
    // #2 run plugin
    return async () => {
      // #3 clean up plugin
    }
  };
};
```

Each plugin is composed by three parts:

1. _Prepare_: this part will be executed when plugin is registered in milkdown by `.use` method.
2. _Run_: this part will be executed when plugin is actually loaded.
3. _Post_: this part will be executed when plugin is removed by `.remove` method or editor is destroyed.

## Timer

Timer can be used to decide when to load the current plugin and how current plugin can influence other plugin's loading status.

You can use `ctx.wait` to wait a timer to finish.

```typescript
import { MilkdownPlugin, Complete } from '@milkdown/core';

const myPlugin: MilkdownPlugin = (ctx) => {
  return async () => {
    const start = Date.now();

    await ctx.wait(Complete);

    const end = Date.now();

    console.log('Milkdown load duration: ', end - start);
  };
};
```

You can also create your own timer and influence other plugins load time.
For example, let's create a plugin that will fetch markdown content from remote server as editor's default value.

```typescript
import { MilkdownPlugin, editorStateTimerCtx, defaultValueCtx, createTimer } from '@milkdown/core';

const RemoteTimer = createTimer('RemoteTimer');

const remotePlugin: MilkdownPlugin = (ctx) => {
  // register timer
  ctx.record(RemoteTimer);

  return async () => {
    // the editorState plugin will wait for this timer to finish before initialize editor state.
    ctx.update(editorStateTimerCtx, (timers) => timers.concat(RemoteTimer));

    const defaultMarkdown = await fetchMarkdownAPI();
    ctx.set(defaultValueCtx, defaultMarkdown);

    // mark timer as complete
    ctx.done(RemoteTimer);

    return async () => {
      await SomeAPI();

      // remove timer when plugin is removed
      ctx.clearTimer(RemoteTimer);
    }
  };
};
```

It has following steps:

1. We use `createTimer` to create a timer, and use `pre.record` to register it into milkdown.
2. We update `editorStateTimerCtx` to tell the internal `editorState` plugin that before initialize editor state, it should wait our remote fetch process finished.
3. After we get value from `fetchMarkdownAPI`, we set it as `defaultValue` and use `ctx.done` to mark a timer as complete.

## Ctx

We have used `ctx` several times in the above example, now we can try to understand what it is.

Ctx is a data container which is shared in the entire editor instance. It's composed by a lot of slices. Every `slice` has a unique key and a value. You can change the value of a slice by `ctx.set` and `ctx.update`. And you can get the value of a slice by `ctx.get` with the slice key or name. Last but not least, you can remove a slice by `post.remove`.

```typescript
import { MilkdownPlugin, createSlice } from '@milkdown/core';

const counterCtx = createSlice(0, 'counter');

const counterPlugin: MilkdownPlugin = (ctx) => {
  ctx.inject(counterCtx);

  return () => {
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

    return () => {
      // remove the slice
      ctx.remove(counterCtx);
    }
  };
};
```

We can use `createSlice` to create a ctx, and use `pre.inject` to inject the ctx into the editor.

And when plugin processing, `ctx.get` can get the value of a ctx, `ctx.set` can set the value of a ctx, and `ctx.update` can update a ctx using callback function.

So, we can use `ctx` combine with `timer` to decide when should a plugin be processed.

```typescript
import { MilkdownPlugin, SchemaReady, Timer, createSlice } from '@milkdown/core';

const examplePluginTimersCtx = createSlice<Timer[]>([], 'example-timer');

const examplePlugin: MilkdownPlugin = (ctx) => {
  ctx.inject(examplePluginTimersCtx, [SchemaReady]);
  return async () => {
      await Promise.all(ctx.get(examplePluginTimersCtx).map((timer) => ctx.wait(timer)));
      // or we can use a simplified syntax sugar
      await ctx.waitTimers(examplePluginTimersCtx);

      // do something
  };
};
```

With this pattern, if other plugins want to delay the process of `examplePlugin`, all they need to do is just add a timer into `examplePluginTimersCtx` with `ctx.update`.

## Summary

Now let's go back to the plugin structure. Since we have the knowledge of `timer` and `ctx`, we can understand what we should do in each part of a plugin.

1. In `prepare` stage of the plugin, we can use `ctx.record` to register a timer, and use `ctx.inject` to inject a slice.
2. In `run` stage of the plugin, we can use `ctx.wait` to wait a timer to finish, and use `ctx.get` to get the value of a slice. We can also change values of slices by `ctx.set` and `ctx.update`. And we can use `ctx.done` to mark a timer as complete.
3. In `post` stage of the plugin, we can use `ctx.clearTimer` to clear a timer, and use `ctx.remove` to remove a slice.
