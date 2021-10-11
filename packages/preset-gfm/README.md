# @milkdown/preset-gfm

Github flavored markdown preset for [milkdown](https://saul-mirone.github.io/milkdown/).
Add support for gfm.

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';

import { gfm } from '@milkdown/preset-gfm';

Editor.make().use(nord).use(gfm).create();
```

## Custom Keymap

```typescript
import { commonmark, blockquote, SupportedKeys } from '@milkdown/preset-gfm';

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
-   NextCell
-   PrevCell
-   ExitTable

## Custom Style

```typescript
import { commonmark, paragraph, heading } from '@milkdown/preset-gfm';

const nodes = commonmark
    .configure(paragraph, {
        className: () => 'my-custom-paragraph',
    })
    .configure(heading, {
        className: (attrs) => `my-custom-heading my-h${attrs.level}`,
    });

Editor.make().use(nodes);
```

# License

Milkdown is open sourced software licensed under [MIT license](https://github.com/Saul-Mirone/milkdown/blob/main/LICENSE).
