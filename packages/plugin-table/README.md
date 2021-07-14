# @milkdown/plugin-table

Table plugin for [milkdown](https://saul-mirone.github.io/milkdown/).
Add support for table commands.

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

// import theme and style
import '@milkdown/theme-nord/lib/theme.css';
import '@milkdown/preset-commonmark/lib/style.css';

import { table } from '@milkdown/plugin-table';
// import style
import '@milkdown/plugin-table/lib/style.css';

const root = document.body;
new Editor({ root }).use(commonmark).use(table).create();
```

## Custom Keymap

```typescript
import { tableNodes, tablePlugin, SupportedKeys, Table } from '@milkdown/plugin-table';
// import style
import '@milkdown/plugin-table/lib/style.css';

const root = document.body;
new Editor({ root })
    .use(commonmark)
    .use(
        tableNodes.configure(Table, {
            keymap: {
                [SupportedKeys.NextCell]: 'Enter',
                [SupportedKeys.PrevCell]: 'Alt-Enter',
            },
        }),
    )
    .use(tablePlugin)
    .create();
```

Keymap supported:

-   NextCell: go to next cell of table.
-   PrevCell: go to prev cell of table.
-   ExitTable: exist current table.
