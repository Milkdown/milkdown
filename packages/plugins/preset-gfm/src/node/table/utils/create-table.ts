import type { Ctx } from '@milkdown/ctx'
import type { Node } from '@milkdown/prose/model'

import {
  tableCellSchema,
  tableHeaderRowSchema,
  tableHeaderSchema,
  tableRowSchema,
  tableSchema,
} from '../schema'

/// @internal
export function createTable(ctx: Ctx, rowsCount = 3, colsCount = 3): Node {
  const cells = Array(colsCount)
    .fill(0)
    .map(() => tableCellSchema.type(ctx).createAndFill()!)

  const headerCells = Array(colsCount)
    .fill(0)
    .map(() => tableHeaderSchema.type(ctx).createAndFill()!)

  const rows = Array(rowsCount)
    .fill(0)
    .map((_, i) =>
      i === 0
        ? tableHeaderRowSchema.type(ctx).create(null, headerCells)
        : tableRowSchema.type(ctx).create(null, cells)
    )

  return tableSchema.type(ctx).create(null, rows)
}
