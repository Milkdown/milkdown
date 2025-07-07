import type { Ctx } from '@milkdown/ctx'
import type { Node } from '@milkdown/prose/model'
import type { Transaction } from '@milkdown/prose/state'
import type { TableRect } from '@milkdown/prose/tables'

import { tableCellSchema, tableRowSchema } from '../schema'

/// @internal
export function addRowWithAlignment(
  ctx: Ctx,
  tr: Transaction,
  { map, tableStart, table }: TableRect,
  row: number
) {
  const rowPos = Array(row)
    .fill(0)
    .reduce((acc, _, i) => {
      return acc + table.child(i).nodeSize
    }, tableStart)

  const cells = Array(map.width)
    .fill(0)
    .map((_, col) => {
      const headerCol = table.nodeAt(map.map[col] as number)
      return tableCellSchema
        .type(ctx)
        .createAndFill({ alignment: headerCol?.attrs.alignment }) as Node
    })

  tr.insert(rowPos, tableRowSchema.type(ctx).create(null, cells))
  return tr
}
