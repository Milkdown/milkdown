# Getting Started

## Overview

Milkdown is a lightweight but powerful WYSIWYG markdown editor. It's made up by two parts:

-   A tiny core which provide markdown parser, serializer and kinds of plugin loader.
-   Lots of plugins provide syntax, commands and components.

With this pattern you can enable or disable any custom syntax you like, such as table, latex and slash commands.
You can even create your own plugin to support your awesome idea.

---

## Features

-   📝 **WYSIWYG Markdown** - Write markdown in an elegant way
-   🎨 **Themable** - Theme can be shared and used with npm packages
-   🎮 **Hackable** - Support your awesome idea by plugin
-   🦾 **Reliable** - Built on top of [prosemirror](https://prosemirror.net/) and [remark](https://github.com/remarkjs/remark)
-   ⚡️ **Slash & Tooltip** - Write fast for everyone, driven by plugin
-   🧮 **Math** - LaTeX math equations support, driven by plugin
-   📊 **Table** - Table support with fluent ui, driven by plugin

## Tech Stack

Milkdown is built on top of these tools:

-   [Prosemirror](https://prosemirror.net/) and it's community - A toolkit for building rich-text editors on the web
-   [Remark](https://github.com/remarkjs/remark) and it's community - Markdown parser done right
-   [Postcss](https://postcss.org/) - Powerful css tool to build theme
-   [TypeScript](https://www.typescriptlang.org/) - Developed by typescript
-   [Prism](https://prismjs.com/) - Code snippets support
-   [Katex](https://katex.org/) - LaTex math rendering

---

## First editor

We have some pieces for you to create a very minimal editor:

> **We use [material icon](https://fonts.google.com/icons) and [Roboto Font](https://fonts.google.com/specimen/Roboto) in our theme**.
> Make sure to include them for having the best experience.

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

// import theme and plugin style
import '@milkdown/theme-nord/lib/theme.css';
import '@milkdown/preset-commonmark/lib/style.css';

const root = document.selectElementById('editor');
new Editor().use(commonmark).create();
```

## Taste the plugin

Now let's add an **undo & redo** support for our editor:

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { history } from '@milkdown/plugin-history';

// import theme and plugin style
import '@milkdown/theme-nord/lib/theme.css';
import '@milkdown/preset-commonmark/lib/style.css';

new Editor().use(commonmark).use(history).create();
```

> `Mod` is `Cmd` for mac and `Ctrl` for other platforms.

Now we can undo a editor by using `Mod-z` and redo it by using `Mod-y` or `Shift-Mod-Z`.
