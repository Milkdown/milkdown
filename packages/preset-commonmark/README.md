# @milkdown/preset-commonmark

Common mark preset for [milkdown](https://saul-mirone.github.io/milkdown/).
Add support for commonmark.

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

// import theme
import '@milkdown/theme-nord/lib/theme.css';

const root = document.body;
new Editor({ root }).use(commonmark).create();
```

## Custom Keymap

```typescript
import { commonmark, Blockquote, SupportedKeys } from '@milkdown/plugin-table';

const nodes = commonmark
    .configure(Blockquote, {
        keymap: {
            [SupportedKeys.Blockquote]: 'Mod-Shift-b',
        },
    });

new Editor({ ... }).use(nodes);
```

Keymap supported:

-   HardBreak
-   Blockquote
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
-   NextListItem
-   SinkListItem
-   LiftListItem

## Custom Style

```typescript
import { commonmark, Paragraph, Heading } from '@milkdown/commonmark';

const nodes = commonmark
    .configure(Paragraph, {
        className: () =>
            'my-custom-paragraph'
    })
    .configure(Heading, {
        className: (attrs) =>
            `my-custom-heading my-h${attrs.level}`
    })

new Editor({ ...  }).use(nodes);
```
