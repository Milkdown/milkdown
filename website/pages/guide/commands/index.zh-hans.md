# 命令

有时候，我们会想更极客地对编辑器进行一些改动，比如点击一个按钮直接可以对选中内容进行斜体样式的切换。

针对这种场景，我们为用户提供了一个命令管理器，其中有许多在预设（Presets）阶段定义和插件中使用的命令。

## 运行命令

我们可以在命令管理器中通过调用特定 **command key** 来进行指定操作。

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

## 创建命令

你可以通过以下步骤来创建命令：

1. 通过 `createCmdKey` 先创建一个 command key。
2. 再创建对应的 command 方法。（它们也只是一些 [prosemirror commands](https://prosemirror.net/docs/guide/#commands)）
3. 在命令管理器中对刚才创建的命令进行注册。

### 例子：不携带参数的命令

我们将在下面的例子中创建命令：

```typescript
import { createCmdKey, MilkdownPlugin, CommandsReady, commandsCtx, schemaCtx } from '@milkdown/core';
import { wrapIn } from 'prosemirror-commands';

export const WrapInBlockquote = createCmdKey();
const plugin: MilkdownPlugin = () => async (ctx) => {
    // wait for command manager ready
    await ctx.wait(CommandsReady);

    const commandManager = ctx.get(commandsCtx);
    const schema = ctx.get(schemaCtx);

    commandManager.create(WrapInBlockquote, () => wrapIn(schema.nodes.blockquote));
};

// call command
commandManager.call(WrapInBlockquote);
```

### 例子：携带参数的命令

我们当然也可以为命令添加参数列表：

```typescript
import { createCmdKey, MilkdownPlugin, CommandsReady, commandsCtx, schemaCtx } from '@milkdown/core';
import { setBlockType } from 'prosemirror-commands';

// use number as the type of argument
export const WrapInHeading = createCmdKey<number>();

const plugin: MilkdownPlugin = () => async (ctx) => {
    // wait for command manager ready
    await ctx.wait(CommandsReady);

    const commandManager = ctx.get(commandsCtx);
    const schema = ctx.get(schemaCtx);

    commandManager.create(WrapInBlockquote, (level = 1) => setBlockType(schema.nodes.heading, { level }));
};

// call command
commandManager.call(WrapInHeading); // turn to h1 by default
commandManager.call(WrapInHeading, 2); // turn to h2
```

---

## 内部命令

### Commonmark

你可以使用 `import { commands } from '@milkdown/preset-commonmark'` 来获取代码中所有的命令。

-   Toggle:
    -   ToggleInlineCode
    -   ToggleItalic
    -   ToggleLink
    -   ToggleBold
-   Insert:
    -   InsertHardbreak
    -   InsertHr
    -   InsertImage
-   Modify:
    -   ModifyLink
    -   ModifyImage
-   Wrap:
    -   WrapInBlockquote
    -   WrapInBulletList
    -   WrapInOrderedList
-   Turn Into:
    -   TurnIntoCodeFence
    -   TurnIntoHeading
    -   TurnIntoText
-   List Operation:
    -   SplitListItem
    -   SinkListItem
    -   LiftListItem

### GFM

你可以使用 `import { commands } from '@milkdown/preset-gfm'` 来获取代码中所有的命令

**GFM 包括来自 commonmark 中所有的命令**，并额外提供:

-   Toggle:
    -   ToggleStrikeThrough
-   Turn Into:
    -   TurnIntoTaskList
-   Task List Operation:
    -   SplitTaskListItem
    -   SinkTaskListItem
    -   LiftTaskListItem
