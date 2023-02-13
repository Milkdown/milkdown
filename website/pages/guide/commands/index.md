# Commands

Sometimes we want to make some changes to editor content programmatically, such as click a button to toggle selection to italic style.
We provide users a command manager with lots of commands defined in presets and plugins to use.

## Run a Command

We can use **command key** to run commands with command manager.

```typescript
import { Editor, commandsCtx } from '@milkdown/core';
import { commonmark, ToggleItalic } from '@milkdown/preset-commonmark';

async function setup() {
  const editor = await Editor.make().use(commonmark).create();

  const toggleItalic = () =>
    editor.action((ctx) => {
      // get command manager
      const commandManager = ctx.get(commandsCtx);

      // call command
      commandManager.call(ToggleItalic);
    });

  // get markdown string:
  $button.onClick = toggleItalic;
}
```

## Create a Command

To create a command, you should follow these steps:

1. Create a command key through `createCmdKey`.
2. Create a command function. (They are just [prosemirror commands](https://prosemirror.net/docs/guide/#commands).)
3. Register the created command in command manager.

### Example: Command without argument

We create a command in the next example:

```typescript
import { createCmdKey, MilkdownPlugin, CommandsReady, commandsCtx, schemaCtx } from '@milkdown/core';
import { wrapIn } from 'prosemirror-commands';

export const WrapInBlockquote = createCmdKey();
const plugin: MilkdownPlugin = (ctx) => async () => {
  // wait for command manager ready
  await ctx.wait(CommandsReady);

  const commandManager = ctx.get(commandsCtx);
  const schema = ctx.get(schemaCtx);

  commandManager.create(
    WrapInBlockquote,
    () => wrapIn(schema.nodes.blockquote)
  );
};

// call command
commandManager.call(WrapInBlockquote);
```

### Example: Command with argument

We can also add a info argument for commands:

```typescript
import { createCmdKey, MilkdownPlugin, CommandsReady, commandsCtx, schemaCtx } from '@milkdown/core';
import { setBlockType } from 'prosemirror-commands';

// use number as the type of argument
export const WrapInHeading = createCmdKey<number>();

const plugin: MilkdownPlugin = (ctx) => async () => {
  // wait for command manager ready
  await ctx.wait(CommandsReady);

  const commandManager = ctx.get(commandsCtx);
  const schema = ctx.get(schemaCtx);

  commandManager.create(
    WrapInBlockquote,
    (level = 1) => setBlockType(schema.nodes.heading, { level })
  );
};

// call command
commandManager.call(WrapInHeading); // turn to h1 by default
commandManager.call(WrapInHeading, 2); // turn to h2
```
