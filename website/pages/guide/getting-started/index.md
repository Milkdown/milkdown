# Getting Started

Milkdown is a lightweight but powerful WYSIWYG markdown editor. It's made up by two parts:

-   A tiny core which provides plugin loader and kinds of internal plugins.
-   Lots of plugins provide syntax, commands and components.

With this pattern you can enable or disable any custom syntax and feature you like, such as table, latex and tooltip. You can also create your own plugin to support your awesome idea.

> 🍼 Fun fact: The Milkdown documentation is rendered by milkdown.

---

## Features

-  📝 **WYSIWYG Markdown** - Write markdown in an elegant way
-  🎨 **Themable** - Theme can be shared and used with npm packages
-  🎮 **Hackable** - Support your awesome idea by plugin
-  🦾 **Reliable** - Built on top of [prosemirror](https://prosemirror.net/) and [remark](https://github.com/remarkjs/remark)
-  ⚡ **Slash & Tooltip** - Write fast for everyone, driven by plugin
-  🧮 **Math** - LaTeX math equations support, driven by plugin
-  📊 **Table** - Table support with fluent ui, driven by plugin
-  🍻 **Collaborate** - Shared editing support with [yjs](https://docs.yjs.dev/), driven by plugin
-  💾 **Clipboard** - Support copy and paste markdown, driven by plugin
-  👍 **Emoji** - Support emoji shortcut and picker, driven by plugin

## Tech Stack

Milkdown is built on top of these libraries:

-   [Prosemirror](https://prosemirror.net/) and its community - A toolkit for building rich-text editors on the web
-   [Remark](https://github.com/remarkjs/remark) and its community - Markdown parser done right
-   [TypeScript](https://www.typescriptlang.org/) - Developed in TypeScript

---

## First editor

We have some pieces of code for you to create a very minimal editor:

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

import { nord } from '@milkdown/theme-nord';
import '@milkdown/theme-nord/style.css';

Editor
  .make()
  .config(nord)
  .use(commonmark)
  .create();
```

## Taste the plugin

Now let's add an **undo & redo** support for our editor:

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { history } from '@milkdown/plugin-history';

import { nord } from '@milkdown/theme-nord';
import '@milkdown/theme-nord/style.css';

Editor
  .make()
  .config(nord)
  .use(commonmark)
  .use(history)
  .create();
```

> `<Mod>` is `<Cmd>` for mac and `<Ctrl>` for other platforms.

Now we can undo a edit by using `<Mod-z>` and redo it by using `<Mod-y>/<Shift-Mod-Z>`.
