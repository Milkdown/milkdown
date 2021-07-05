# Using Plugins

## Tasting a Plugin

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

---

## Finding Plugins

### Official Plugins

Milkdown provides the following official plugins:

-   [@milkdown/plugin-table](https://www.npmjs.com/package/@milkdown/plugin-table)

    Add table syntax support.

-   [@milkdown/plugin-prism](https://www.npmjs.com/package/@milkdown/plugin-prism)

    Add [prism](https://prismjs.com/) support for code block highlight.

-   [@milkdown/plugin-math](https://www.npmjs.com/package/@milkdown/plugin-math)

    Add [LaTeX](https://en.wikipedia.org/wiki/LaTeX) support for math.

-   [@milkdown/plugin-tooltip](https://www.npmjs.com/package/@milkdown/plugin-tooltip)

    Add selected tooltip for text.

-   [@milkdown/plugin-slash](https://www.npmjs.com/package/@milkdown/plugin-slash)

    Add slash commands support.

### Community plugins

Check out [awesome-milkdown](https://github.com/Saul-Mirone/awesome-milkdown) to find community plugins - you can also submit a PR to list your plugins there.
