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

### Heading

-   getId: (node: PMNode) => string
    Pass in a option to generate an id for the heading.
-   displayHashtag: boolean
    Whether to display the hashtag or not. Default is true.

### Image

-   placeholder: The placeholder of empty status.
-   isBlock: Whether the image is a block (render as a row).
-   input:
    -   placeholder: The placeholder of image url input.
    -   buttonText: The button text of image url input.

### CodeFence

-   languageList: _string[]_. The selectable languages list of code fence needs to be enabled.

## Inline Sync Plugin

When users type something, the plugin will transform the line (for better performance) to real markdown AST by serializer and render the AST to dom by parser, thus the input texts can be displayed correctly.

The inline sync plugin is part of `@milkdown/preset-commonmark` so you don't need to use it yourself. It will be enabled by default.

### Config

You can configure the behavior of inline sync plugin to adapt for some special cases:

```typescript
editor.config((ctx) => {
    ctx.update(inlineSyncConfigCtx, (prevCfg) => ({
        ...prevCfg,
        // your config here.
    }));
});
```

The possible properties are:

### shouldSyncNode

A function to control whether the inline sync plugin should sync for the user change. You can inspect the current prosemirror node and the future prosemirror node (which will replace the current one) to decide whether to skip this sync action.

### movePlaceholder

The inline sync plugin will insert a special charater that stands for the current user's `cursor`, this function is used to control whether we need to move the user's cursor to a right position. For example:

```markdown
This is a *|*test\*\*\* line.
```

We use `|` to stand for the user cursor. If user type a `*` now and the cursor will be between two `*`, however, the `***test***` should be a word decorated by inline and bold style. So, the cursor should move to `***|test***`, if it stays at `**|*test***`, we'll get wrong content.

### placeholderConfig

Use to decide which character the plugin will use to insert as placeholder. You should use a character that the user would never insert it themselves.

Default value:

```typescript
const placeholderConfig = {
    hole: '∅',
    punctuation: '⁂',
    char: '∴',
};
```

### globalNodes

In markdown, sometimes the parser and serializer needs some additional context for some nodes. For example, if user type `Test[^1]`, the parser will search for footnote definition for `[^1]`, if there is a definition, a footnote reference node will be generated, otherwise it will be a normal text node. So, we need to add `footnote_definition` in `globalNodes` list to tell the inline sync plugin it needs to collect this kind of nodes when sync.
