# 命令

有時候，我們會想更即刻的對編輯器進行一些動作，比如點選一個按鈕直接可以對選中內容進行斜體樣式的切換。

針對這種場景，我們為使用者提供了一個命令管理器，其中有許多在預設（Presets）階段定義和插件中使用的命令。

## 執行命令

我們可以在命令管理器中通過呼叫特定 **command key** 來進行指定操作。

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

## 建立命令

你可以通過以下步驟來建立命令：

1. 通過 `createCmdKey` 先建立一個 command key。
2. 再建立對應的 command 方法。（它們也只是一些 [prosemirror commands](https://prosemirror.net/docs/guide/#commands)）
3. 在命令管理器中對剛才建立的命令進行註冊。

### 範例：不攜帶參數的命令

我們將在下面的例子中建立命令：

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

### 範例：攜帶參數的命令

我們當然也可以為命令新增參數列表：

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

## 內部命令

### Commonmark

你可以使用 `import { commands } from '@milkdown/preset-commonmark'` 來獲取程式碼中所有的命令。

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

你可以使用 `import { commands } from '@milkdown/preset-gfm'` 來獲取程式碼中所有的命令

**GFM 包括來自 commonmark 中所有的命令**，並額外提供:

-   Toggle:
    -   ToggleStrikeThrough
-   Turn Into:
    -   TurnIntoTaskList
-   Task List Operation:
    -   SplitTaskListItem
    -   SinkTaskListItem
    -   LiftTaskListItem
