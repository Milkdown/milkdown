# Keyboard Shortcuts

Keyboard shortcuts are provided by default from both presets and plugins. Depending on your behavior, you might want to change them to what you like.

---

## Configure Shortcuts

You can configure shortcuts just like configure their styles:

```typescript
import { commonmarkNodes, commonmarkPlugins, blockquote, SupportedKeys } from '@milkdown/preset-commonmark';

Editor.make().use(commonmarkPlugins).use(nodes);

const nodes = commonmarkNodes.configure(blockquote, {
    keymap: {
        [SupportedKeys.Blockquote]: 'Mod-Shift-b',
        // or you may want to bind multiple keys:
        [SupportedKeys.Blockquote]: ['Mod-Shift-b', 'Mod-b'],
    },
});

Editor.make().use(nodes).use(commonmarkPlugins);
```

You can inspect the `SupportedKeys` enum to find out the supported commands that can be configured.

If there is no supported commands for the behavior you expect, you can write a [prosemirror keymap plugin](https://github.com/ProseMirror/prosemirror-keymap) to do this.
You can read the [composable plugins](/composable-plugins) section to learn how to convert a prosemirror plugin into milkdown plugin.

---

## Default Shortcuts Table

> `Mod` is `Cmd` on macOS and `Ctrl` for windows/linux.

### Essentials

| Action    | Key       |
| --------- | --------- |
| Copy      | Mod-c     |
| Cut       | Mod-x     |
| Paste     | Mod-v     |
| New Line  | Enter     |
| Exit Code | Mod-Enter |

### History

| Action | Key         |
| ------ | ----------- |
| Undo   | Mod-z       |
| Redo   | Mod-Shift-z |

### Mark

| Action         | Key       |
| -------------- | --------- |
| Bold           | Mod-b     |
| Italic         | Mod-i     |
| Inline Code    | Mod-e     |
| Strike Through | Mod-Alt-x |

### Paragraph

| Action      | Key         |
| ----------- | ----------- |
| Normal Text | Mod-Alt-0   |
| H1          | Mod-Alt-1   |
| H2          | Mod-Alt-2   |
| H3          | Mod-Alt-3   |
| H4          | Mod-Alt-4   |
| H5          | Mod-Alt-5   |
| H6          | Mod-Alt-6   |
| Code Fence  | Mod-Alt-c   |
| Line Break  | Shift-Enter |

### List

| Action         | Key       |
| -------------- | --------- |
| Ordered List   | Mod-Alt-7 |
| Bullet List    | Mod-Alt-8 |
| Task List      | Mod-Alt-9 |
| Sink List Item | Mod-]     |
| Lift List Item | Mod-[     |

### Table

| Action               | Key       |
| -------------------- | --------- |
| Next Cell            | Mod-]     |
| Prev Cell            | Mod-[     |
| Exit Table and Break | Mod-Enter |
