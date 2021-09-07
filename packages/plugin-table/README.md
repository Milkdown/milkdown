# @milkdown/plugin-table

Table plugin for [milkdown](https://saul-mirone.github.io/milkdown/).
Add support for table commands.

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

import { table } from '@milkdown/plugin-table';

Editor.make().use(nord).use(commonmark).use(table).create();
```

## Custom Keymap

```typescript
import { tableNodes, tablePlugin, SupportedKeys, table } from '@milkdown/plugin-table';

Editor.make()
    .use(commonmark)
    .use(
        tableNodes.configure(table, {
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
