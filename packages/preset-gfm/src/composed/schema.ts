/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin } from '@milkdown/core'
import { strikethroughSchema } from '../mark'
import { extendListItemSchemaForTask, footnoteDefinitionSchema, footnoteReferenceSchema, tableCellSchema, tableHeaderSchema, tableRowSchema, tableSchema } from '../node'

export const schema: MilkdownPlugin[] = [
  extendListItemSchemaForTask,

  tableSchema,
  tableRowSchema,
  tableHeaderSchema,
  tableCellSchema,

  footnoteDefinitionSchema,
  footnoteReferenceSchema,

  strikethroughSchema,
].flat()
