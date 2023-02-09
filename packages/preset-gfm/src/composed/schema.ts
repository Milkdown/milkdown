/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin } from '@milkdown/ctx'
import { strikethroughAttr, strikethroughSchema } from '../mark'
import { extendListItemSchemaForTask, footnoteDefinitionSchema, footnoteReferenceSchema, tableCellSchema, tableHeaderSchema, tableRowSchema, tableSchema } from '../node'

/// @internal
export const schema: MilkdownPlugin[] = [
  extendListItemSchemaForTask,

  tableSchema,
  tableRowSchema,
  tableHeaderSchema,
  tableCellSchema,

  footnoteDefinitionSchema,
  footnoteReferenceSchema,

  strikethroughAttr,
  strikethroughSchema,
].flat()
