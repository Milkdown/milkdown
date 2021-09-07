# @milkdown/preset-commonmark

Common mark preset for [milkdown](https://saul-mirone.github.io/milkdown/).
Add support for commonmark.

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';

import { commonmark } from '@milkdown/preset-commonmark';
import '@milkdown/preset-commonmark/lib/style.css';

Editor.make().use(nord).use(commonmark).create();
```

## Custom Keymap

```typescript
import { commonmark, blockquote, SupportedKeys } from '@milkdown/preset-commonmark';

const nodes = commonmark.configure(blockquote, {
    keymap: {
        [SupportedKeys.Blockquote]: 'Mod-Shift-b',
    },
});

Editor.make().use(nodes);
```

Keymap supported:

-   HardBreak
-   Blockquote
-   TaskList
-   BulletList
-   OrderedList
-   CodeFence
-   H1
-   H2
-   H3
-   H4
-   H5
-   H6
-   Text
-   CodeInline
-   Em
-   Bold
-   StrikeThrough
-   NextListItem
-   SinkListItem
-   LiftListItem

## Custom Style

```typescript
import { commonmark, paragraph, heading } from '@milkdown/commonmark';

const nodes = commonmark
    .configure(paragraph, {
        className: () => 'my-custom-paragraph',
    })
    .configure(heading, {
        className: (attrs) => `my-custom-heading my-h${attrs.level}`,
    });

Editor.make().use(nodes);
```
