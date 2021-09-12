# Using Plugins

## Tasting a Plugin

In fact, all features in milkdown are supported by plugin.
The `commonmark` we use is a plugin. Now we can try more plugins:

```typescript
import { Editor } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';
import { commonmark } from '@milkdown/preset-commonmark';
import { tooltip } from '@milkdown/plugin-tooltip';
import { slash } from '@milkdown/plugin-slash';

Editor.make().use(nord).use(commonmark).use(tooltip).use(slash).create();
```

---

## Finding Plugins

### Official Plugins

Milkdown provides the following official plugins:

| name                                                                                           | description                                                        |
| :--------------------------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| [@milkdown/preset-commonmark](https://www.npmjs.com/package/@milkdown/preset-commonmark)       | Add [commonmark](https://commonmark.org/) syntax support           |
| [@milkdown/preset-gfm](https://www.npmjs.com/package/@milkdown/preset-gfm)                     | Add [gfm](https://github.github.com/gfm/) syntax support           |
| [@milkdown/plugin-history](https://www.npmjs.com/package/@milkdown/plugin-history)             | Add undo & redo support                                            |
| [@milkdown/plugin-clipboard](https://www.npmjs.com/package/@milkdown/plugin-clipboard)         | Add markdown copy & paste support                                  |
| [@milkdown/plugin-cursor](https://www.npmjs.com/package/@milkdown/plugin-cursor)               | Add drop & gap cursor                                              |
| [@milkdown/plugin-listener](https://www.npmjs.com/package/@milkdown/plugin-listener)           | Add listener support                                               |
| [@milkdown/plugin-collaborative](https://www.npmjs.com/package/@milkdown/plugin-collaborative) | Add collaborative editing support                                  |
| [@milkdown/plugin-table](https://www.npmjs.com/package/@milkdown/plugin-table)                 | Add table syntax support (already included in gfm)                 |
| [@milkdown/plugin-prism](https://www.npmjs.com/package/@milkdown/plugin-prism)                 | Add [prism](https://prismjs.com/) support for code block highlight |
| [@milkdown/plugin-math](https://www.npmjs.com/package/@milkdown/plugin-math)                   | Add [LaTeX](https://en.wikipedia.org/wiki/LaTeX) support for math  |
| [@milkdown/plugin-tooltip](https://www.npmjs.com/package/@milkdown/plugin-tooltip)             | Add selected tooltip for text                                      |
| [@milkdown/plugin-slash](https://www.npmjs.com/package/@milkdown/plugin-slash)                 | Add slash commands support                                         |
| [@milkdown/plugin-emoji](https://www.npmjs.com/package/@milkdown/plugin-emoji)                 | Add emoji support                                                  |

### Community plugins

Check out [awesome-milkdown](https://github.com/Saul-Mirone/awesome-milkdown) to find community plugins - you can also submit a PR to list your plugins there.
