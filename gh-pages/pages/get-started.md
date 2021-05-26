# Get Started

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
-   🦾 **Reliable** - Built on top of [prosemirror](https://prosemirror.net/) and [markdown-it](https://markdown-it.github.io/)
-   ⚡️ **Slash & Tooltip** - Write fast for everyone, driven by plugin
-   🧮 **Math** - LaTeX math equations support, driven by plugin
-   📊 **Table** - Table support with fluent ui, driven by plugin

## Tech Stack

Milkdown is built on top of these tools:

-   [Prosemirror](https://prosemirror.net/) and it's community - A toolkit for building rich-text editors on the web
-   [Markdown-it](https://markdown-it.github.io/) and it's community - Markdown parser done right
-   [Postcss](https://postcss.org/) - Powerful css tool to build theme
-   [TypeScript](https://www.typescriptlang.org/) - Developed by typescript
-   [Prism](https://prismjs.com/) - Code snippets support
-   [Katex](https://katex.org/) - LaTex math rendering

---

## First editor

We have some pieces for you to create a very minimal editor:

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

// import theme
import '@milkdown/theme-nord/lib/theme.css';

const root = document.body;
new Editor({ root }).use(commonmark).create();
```

**We use [material icon](https://fonts.google.com/icons) and [Roboto Font](https://fonts.google.com/specimen/Roboto) in our theme**.
Make sure to include them for best experience. For example:

```html
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preload" as="style" href="https://fonts.googleapis.com/css?family=Roboto" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto" />
<link rel="preload" as="style" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
<link rel="preload" as="style" href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" />
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" />
```

## Taste the plugin

In fact, all features in milkdown are supported by plugin.
The `commonmark` we use is a plugin. Now we can try more plugins:

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

import '@milkdown/theme-nord/lib/theme.css';

import { tooltip } from '@milkdown/plugin-tooltip';
// don't forget to import style!
import '@milkdown/plugin-tooltip/lib/style.css';

const root = document.body;
new Editor({ root }).use(commonmark).use(tooltip).create();
```
