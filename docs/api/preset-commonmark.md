# @milkdown/preset-commonmark

Commonmark preset for [milkdown](https://milkdown.dev/).

```typescript
import { Editor } from "@milkdown/kit/core";
import { commonmark } from "@milkdown/kit/preset/commonmark";

Editor.make().use(commonmark).create();
```

@commonmark

# Attr

The context with the name `attr` is used to set the attributes of the node and mark.
You can set the attributes by setting the `attr` in `editor.config`.

For example, you can set the `data-test-id` and `class` of all the `paragraph` nodes.

```typescript
import { commonmark, paragraphAttr } from "@milkdown/kit/preset/commonmark";

Editor.make()
  .config((ctx) => {
    ctx.set(paragraphAttr.key, {
      "data-test-id": uuid(),
      class: "paragraph",
    });
  })
  .use(commonmark)
  .create();
```

---

# Nodes

## Doc

@docSchema

## Text

@textSchema

## Paragraph

@paragraphAttr
@paragraphSchema
@turnIntoTextCommand
@paragraphKeymap

## Heading

@headingAttr
@headingSchema
@headingIdGenerator
@wrapInHeadingInputRule
@wrapInHeadingCommand
@downgradeHeadingCommand
@headingKeymap

## Image

@imageAttr
@imageSchema
@insertImageCommand
@updateImageCommand
@insertImageInputRule

## Blockquote

@blockquoteAttr
@blockquoteSchema
@wrapInBlockquoteInputRule
@wrapInBlockquoteCommand
@blockquoteKeymap

## Ordered List

@orderedListAttr
@orderedListSchema
@wrapInOrderedListInputRule
@wrapInOrderedListCommand
@orderedListKeymap

## Bullet List

@bulletListAttr
@bulletListSchema
@wrapInBulletListInputRule
@wrapInBulletListCommand
@bulletListKeymap

## List Item

@listItemAttr
@listItemSchema
@sinkListItemCommand
@liftListItemCommand
@splitListItemCommand
@liftFirstListItemCommand
@listItemKeymap

## Code Block

@codeBlockAttr
@codeBlockSchema
@createCodeBlockInputRule
@createCodeBlockCommand
@updateCodeBlockLanguageCommand
@codeBlockKeymap

## Hard Break

@hardbreakAttr
@hardbreakSchema
@insertHardbreakCommand
@hardbreakKeymap

## Horizontal Rule

@hrAttr
@hrSchema
@insertHrInputRule
@insertHrCommand

## HTML

@htmlAttr
@htmlSchema

---

# Marks

## Emphasis

@emphasisAttr
@emphasisSchema
@toggleEmphasisCommand
@emphasisKeymap
@emphasisStarInputRule
@emphasisUnderscoreInputRule

## Strong

@strongAttr
@strongSchema
@toggleStrongCommand
@strongKeymap
@strongInputRule

## Inline Code

@inlineCodeAttr
@inlineCodeSchema
@toggleInlineCodeCommand
@inlineCodeKeymap
@inlineCodeInputRule

## Link

@linkAttr
@linkSchema
@toggleLinkCommand
@updateLinkCommand

---

# Prosemirror Plugins

@inlineNodesCursorPlugin

@hardbreakFilterPlugin
@hardbreakFilterNodes

@syncHeadingIdPlugin

@syncListOrderPlugin

@hardbreakClearMarkPlugin

---

# Remark Plugins

@remarkInlineLinkPlugin
@remarkAddOrderInListPlugin
@remarkLineBreak
@remarkMarker
