import type { Ctx } from '@milkdown/ctx'
import type { Node } from '@milkdown/prose/model'
import type { Transaction } from '@milkdown/prose/state'

import { parserCtx } from '@milkdown/core'
import { computeDocDiff } from '@milkdown/plugin-diff'

/// Parse a markdown buffer and apply the diff against the current doc.
/// Returns the updated transaction and the parsed doc (if successful).
export function flushBuffer(
  ctx: Ctx,
  tr: Transaction,
  buffer: string
): { tr: Transaction; newDoc: Node | null } {
  const parser = ctx.get(parserCtx)
  const newDoc = parser(buffer)
  if (!newDoc) return { tr, newDoc: null }

  const changes = computeDocDiff(tr.doc, newDoc)
  for (let i = changes.length - 1; i >= 0; i--) {
    const change = changes[i]!
    const newContent = newDoc.slice(change.fromB, change.toB)
    tr = tr.replace(change.fromA, change.toA, newContent)
  }

  return { tr, newDoc }
}
