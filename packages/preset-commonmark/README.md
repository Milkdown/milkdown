# @milkdown/preset-commonmark

Common mark preset for [milkdown](https://saul-mirone.github.io/milkdown/).
Add support for commonmark.

# Example Usage

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

## Other Options

### Image

-   placeholder
    -   loading: _string_. The placeholder of loading status.
    -   empty: _string_. The placeholder of empty status.
    -   failed: _string_. The placeholder of failed status.

### CodeFence

-   languageList: _string[]_. The selectable languages list of code fence needs to be enabled.

# License

Milkdown is open sourced software licensed under [MIT license](https://github.com/Saul-Mirone/milkdown/blob/main/LICENSE).
