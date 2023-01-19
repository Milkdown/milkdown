# @milkdown/plugin-history

History undo & redo support for [milkdown](https://milkdown.dev/).

## Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

import { history } from '@milkdown/plugin-history';

Editor.make().use(nord).use(commonmark).use(history).create();
```

## Plugin

@history
@historyProviderConfig
@historyProviderPlugin

## Keymap

@historyKeymap

You can remap the keymap by using the `historyKeymap.key`.

```typescript
import { history, historyKeymap } from '@milkdown/plugin-history';

Editor.make()
    .config((ctx) => {
      ctx.set(historyKeymap.key, {
        // Remap to one shortcut.
        Undo: 'Mod-z',
        // Remap to multiple shortcuts.
        Redo: ['Mod-y', 'Shift-Mod-z'],
      })
    })
    .use(nord)
    .use(commonmark)
    .use(history)
    .create();
```

## Commands

@Undo
@Redo
@undoCommand
@redoCommand

You can call the commands programmatically.

```typescript
import { Undo, history } from '@milkdown/plugin-history';
import { callCommand } from '@milkdown/plugin-utils';

const editor = await Editor.make().use(/* ... */).use(history).create();

editor.action(callCommand(Undo))
```
