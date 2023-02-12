# Using Plugins

All features in milkdown are provided by plugin.
Such as syntax, components, etc.
Now we can try more plugins:

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { tooltip } from '@milkdown/plugin-tooltip';
import { slash } from '@milkdown/plugin-slash';

Editor
  .make()
  .use(commonmark)
  .use(tooltip)
  .use(slash)
  .create();
```

---

## Toggling Plugins

You can also toggle plugins programmatically:

```typescript
import { Editor } from '@milkdown/core';
import { someMilkdownPlugin } from 'some-milkdown-plugin';

const editor = await Editor
  .config(configForPlugin)
  .use(someMilkdownPlugin)
  .create();

// remove plugin
await editor.remove(someMilkdownPlugin);

// remove config
editor.removeConfig(configForPlugin);

// add another plugin
editor.use(anotherMilkdownPlugin)

// Recreate the editor to apply changes.
await editor.create();
```

---

## Official Plugins

Milkdown provides the following official plugins:

* [@milkdown/preset-commonmark](/preset-commonmark):

   Add [commonmark](https://commonmark.org/) syntax support.

* [@milkdown/preset-gfm](/preset-gfm)

  Add [gfm](https://github.github.com/gfm/) syntax support.

* [@milkdown/plugin-history](/plugin-history)

  Add undo & redo support.

* [@milkdown/plugin-clipboard](/plugin-clipboard)

  Add markdown copy & paste support.

* [@milkdown/plugin-cursor](/plugin-cursor)

  Add drop & gap cursor.

* [@milkdown/plugin-listener](/plugin-listener)

  Add listener support.

* [@milkdown/plugin-collaborative](/plugin-collaborative)

  Add collaborative editing support, powered by [yjs](https://docs.yjs.dev/).

* [@milkdown/plugin-prism](/plugin-prism)

  Add [prism](https://prismjs.com/) support for code block highlight.

* [@milkdown/plugin-math](/plugin-math)

  Add [LaTeX](https://en.wikipedia.org/wiki/LaTeX) support for math, powered by [Katex](https://katex.org/).

* [@milkdown/plugin-tooltip](/plugin-tooltip)

  Add universal tooltip support.

* [@milkdown/plugin-slash](/plugin-slash)

  Add universal slash commands support.

* [@milkdown/plugin-emoji](/plugin-emoji)

  Add emoji shortcut support (something like `:+1:`), and use [twemoji](https://twemoji.twitter.com/) to display emoji.

* [@milkdown/plugin-diagram](/plugin-diagram)

  Add [mermaid](https://mermaid-js.github.io/mermaid/#/) diagram support.

* [@milkdown/plugin-indent](/plugin-indent)

  Add tab indent support.

* [@milkdown/plugin-upload](/plugin-upload)

  Add drop and upload support.

* [@milkdown/plugin-block](/plugin-block)

  Add a drag handle for every block node.

## Community plugins

Check out [awesome-milkdown](https://github.com/Saul-Mirone/awesome-milkdown) to find community plugins. You can also submit a PR to list your plugins there.
