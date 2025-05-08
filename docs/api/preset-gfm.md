# @milkdown/preset-gfm

Github flavored markdown preset for [milkdown](https://milkdown.dev/).

> Notice: The GFM preset needs to be used with the [commonmark preset](https://milkdown.dev/api/preset-commonmark).

```typescript
import { Editor } from "@milkdown/kit/core";
import { commonmark } from "@milkdown/kit/preset/commonmark";
import { gfm } from "@milkdown/kit/preset/gfm";

Editor.make().use(commonmark).use(gfm).create();
```

@gfm

---

# Table

@tableSchema
@tableRowSchema
@tableHeaderSchema
@tableHeaderRowSchema
@tableCellSchema

@insertTableInputRule
@tableKeymap

## Commands

@goToPrevTableCellCommand
@goToNextTableCellCommand
@exitTable
@insertTableCommand
@moveRowCommand
@moveColCommand
@selectRowCommand
@selectColCommand
@selectTableCommand
@deleteSelectedCellsCommand
@addColBeforeCommand
@addColAfterCommand
@addRowBeforeCommand
@addRowAfterCommand
@setAlignCommand

## Table Utils

@findTable
@getCellsInCol
@getCellsInRow
@getAllCellsInTable
@selectCol
@selectRow
@selectTable
@moveCol
@moveRow

@MoveColParams
@MoveRowParams

## Prosemirror Plugins

@autoInsertSpanPlugin
@columnResizingPlugin
@tableEditingPlugin
@keepTableAlignPlugin

---

# Task List

@extendListItemSchemaForTask
@wrapInTaskListInputRule

---

# Strike Through

@strikethroughAttr
@strikethroughSchema
@toggleStrikethroughCommand
@strikethroughKeymap
@strikethroughInputRule

---

# Footnote

@footnoteDefinitionSchema
@footnoteReferenceSchema

---

# Others

@remarkGFMPlugin
@markInputRules
