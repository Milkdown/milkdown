# @milkdown/preset-gfm

Github flavored markdown preset for [milkdown](https://milkdown.dev/).

```typescript
import { Editor } from '@milkdown/core';

import { gfm } from '@milkdown/preset-gfm';

Editor
  .make()
  .use(gfm)
  .create();
```

@gfm

---

# Table

@tableSchema
@tableRowSchema
@tableHeaderSchema
@tableCellSchema

@insertTableInputRule
@tableKeymap

## Commands

@goToPrevTableCellCommand
@goToNextTableCellCommand
@breakTableCommand
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

---

# Task List

@extendListItemSchemaForTask

---

# Strike Through

@strikethroughAttr
@strikethroughSchema
@toggleStrikethroughCommand
@strikethroughKeymap

---

# Footnote

@footnoteDefinitionSchema
@footnoteReferenceSchema
