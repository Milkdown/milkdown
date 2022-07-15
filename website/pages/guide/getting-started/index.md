# Getting Started

## Overview

Milkdown is a lightweight but powerful WYSIWYG markdown editor. It's made up by two parts:

-   A tiny core which provides plugin loader and kinds of internal plugins.
-   Lots of plugins provide syntax, commands and components.

With this pattern you can enable or disable any custom syntax and feature you like, such as table, latex and slash commands. You can even create your own plugin to support your awesome idea.

> 🍼 Fun fact: The Milkdown documentation is rendered by milkdown.

---

## Features

-   [x] 📝 **WYSIWYG Markdown** - Write markdown in an elegant way
-   [x] 🎨 **Themable** - Theme can be shared and used with npm packages
-   [x] 🎮 **Hackable** - Support your awesome idea by plugin
-   [x] 🦾 **Reliable** - Built on top of [prosemirror](https://prosemirror.net/) and [remark](https://github.com/remarkjs/remark)
-   [x] ⚡ **Slash & Tooltip** - Write fast for everyone, driven by plugin
-   [x] 🧮 **Math** - LaTeX math equations support, driven by plugin
-   [x] 📊 **Table** - Table support with fluent ui, driven by plugin
-   [x] 🍻 **Collaborate** - Shared editing support with [yjs](https://docs.yjs.dev/), driven by plugin
-   [x] 💾 **Clipboard** - Support copy and paste markdown, driven by plugin
-   [x] 👍 **Emoji** - Support emoji shortcut and picker, driven by plugin

## Tech Stack

Milkdown is built on top of these tools:

-   [Prosemirror](https://prosemirror.net/) and its community - A toolkit for building rich-text editors on the web
-   [Remark](https://github.com/remarkjs/remark) and its community - Markdown parser done right
-   [TypeScript](https://www.typescriptlang.org/) - Developed in TypeScript
-   [Emotion](https://emotion.sh/) - Powerful CSS in JS tool to write styles
-   [Prism](https://prismjs.com/) - Code snippets support
-   [Katex](https://katex.org/) - LaTex math rendering

---

## First editor

We have some pieces of code for you to create a very minimal editor:

> **We use [material icon](https://fonts.google.com/icons) and [Roboto Font](https://fonts.google.com/specimen/Roboto) in our theme**.
> Make sure to include them for having the best experience.

```typescript
import { Editor } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';
import { commonmark } from '@milkdown/preset-commonmark';

Editor.make().use(nord).use(commonmark).create();
```

## Taste the plugin

Now let's add an **undo & redo** support for our editor:

```typescript
import { Editor } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';
import { commonmark } from '@milkdown/preset-commonmark';
import { history } from '@milkdown/plugin-history';

Editor.make().use(nord).use(commonmark).use(history).create();
```

> `Mod` is `Cmd` for mac and `Ctrl` for other platforms.

Now we can undo a edit by using `Mod-z` and redo it by using `Mod-y` or `Shift-Mod-Z`.

---

## Online Demo

!CodeSandBox{milkdown-vanilla-setup-8xobc?fontsize=14&hidenavigation=1&theme=dark&view=preview}
