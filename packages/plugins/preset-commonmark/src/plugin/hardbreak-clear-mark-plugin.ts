import type { Transaction } from '@milkdown/prose/state'

import { Plugin, PluginKey } from '@milkdown/prose/state'
import { AddMarkStep } from '@milkdown/prose/transform'
import { $prose } from '@milkdown/utils'

import { withMeta } from '../__internal__'
import { hardbreakSchema } from '../node'

/// This plugin is used to clear the marks around the hardbreak node.
///
/// Only hard breaks (`isInline: false`) are affected. A soft break is just
/// whitespace inside the run, so a mark applied across it stays as it is.
export const hardbreakClearMarkPlugin = $prose((ctx) => {
  return new Plugin({
    key: new PluginKey('MILKDOWN_HARDBREAK_MARKS'),
    appendTransaction: (trs, _oldState, newState) => {
      if (!trs.length) return

      const hardbreak = hardbreakSchema.type(ctx)
      let tr: Transaction | undefined

      trs.forEach((t, trIndex) => {
        t.steps.forEach((step, stepIndex) => {
          if (!(step instanceof AddMarkStep)) return

          // The step's positions refer to the document right after it. Map
          // them through every later step and transaction, so they point
          // into newState.doc.
          const toNewDoc = (pos: number, assoc: number) =>
            trs
              .slice(trIndex)
              .reduce(
                (mapped, later, i) =>
                  (i === 0
                    ? later.mapping.slice(stepIndex + 1)
                    : later.mapping
                  ).map(mapped, assoc),
                pos
              )

          const from = toNewDoc(step.from, -1)
          const to = toNewDoc(step.to, 1)
          newState.doc.nodesBetween(from, to, (node, pos) => {
            if (node.type !== hardbreak || node.attrs.isInline) return
            if (!node.marks.length) return

            tr ??= newState.tr
            tr.setNodeMarkup(pos, hardbreak, node.attrs, [])
          })
        })
      })

      return tr
    },
  })
})

withMeta(hardbreakClearMarkPlugin, {
  displayName: 'Prose<hardbreakClearMarkPlugin>',
  group: 'Prose',
})
