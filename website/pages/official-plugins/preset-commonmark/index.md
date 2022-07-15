# @milkdown/preset-commonmark

Commonmark preset for [milkdown](https://milkdown.dev/).

```typescript
import { Editor } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';

import { commonmark } from '@milkdown/preset-commonmark';

Editor.make().use(nord).use(commonmark).create();
```

## Custom Keymap

```typescript
import { commonmarkNodes, commonmarkPlugins, blockquote, SupportedKeys } from '@milkdown/preset-commonmark';

const nodes = commonmarkNodes.configure(blockquote, {
    keymap: {
        [SupportedKeys.Blockquote]: 'Mod-Shift-b',
    },
});

Editor.make().use(commonmarkPlugins).use(nodes);
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

## Custom Class Name

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

## Node Options

### Image

-   placeholder: The placeholder of empty status.
-   isBlock: Whether the image is a block (render as a row).
-   input:
    -   placeholder: The placeholder of image url input.
    -   buttonText: The button text of image url input.

### CodeFence

-   languageList: _string[]_. The selectable languages list of code fence needs to be enabled.
