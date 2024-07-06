import type { MilkdownPlugin } from '@milkdown/ctx'
import { strikethroughAttr, strikethroughSchema } from '../mark'
import {
  extendListItemSchemaForTask,
  footnoteDefinitionSchema,
  footnoteReferenceSchema,
  tableCellSchema,
  tableHeaderRowSchema,
  tableHeaderSchema,
  tableRowSchema,
  tableSchema,
} from '../node'

/// @internal
export const schema: MilkdownPlugin[] = [
  extendListItemSchemaForTask,

  tableSchema,
  tableHeaderRowSchema,
  tableRowSchema,
  tableHeaderSchema,
  tableCellSchema,

  footnoteDefinitionSchema,
  footnoteReferenceSchema,

  strikethroughAttr,
  strikethroughSchema,
].flat()
