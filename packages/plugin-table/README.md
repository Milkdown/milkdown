# @milkdown/plugin-table

Table plugin for [milkdown](https://saul-mirone.github.io/milkdown/).
Add support for table commands.

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

// import theme
import '@milkdown/theme-nord/lib/theme.css';

import { table } from '@milkdown/plugin-table';
// import style
import '@milkdown/plugin-table/lib/style.css';

const root = document.body;
new Editor({ root }).use(commonmark).use(table()).create();
```

## Custom Keymap

```typescript
import { table, SupportedKeys } from '@milkdown/plugin-table';
// import style
import '@milkdown/plugin-table/lib/style.css';

const root = document.body;
new Editor({ root })
    .use(commonmark)
    .use(
        table({
            keymap: {
                [SupportedKeys.NextCell]: 'Enter',
                [SupportedKeys.PrevCell]: 'Alt-Enter',
            },
        }),
    )
    .create();
```

Keymap supported:

-   NextCell: go to next cell of table.
-   PrevCell: go to prev cell of table.
-   ExitTable: exist current table.
