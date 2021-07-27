# @milkdown/preset-commonmark

Common mark preset for [milkdown](https://saul-mirone.github.io/milkdown/).
Add support for commonmark.

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

// import theme and style
import '@milkdown/theme-nord/lib/theme.css';
import '@milkdown/preset-commonmark/lib/style.css';

new Editor().use(commonmark).create();
```

## Custom Keymap

```typescript
import { commonmarkNodes, commonmarkPlugins, blockquote, SupportedKeys } from '@milkdown/preset-commonmark';

const nodes = commonmarkNodes.configure(blockquote, {
    keymap: {
        [SupportedKeys.Blockquote]: 'Mod-Shift-b',
    },
});

new Editor().use(commonmarkPlugins).use(nodes);
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
