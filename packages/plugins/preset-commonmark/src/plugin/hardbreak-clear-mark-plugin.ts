import { Plugin, PluginKey } from '@milkdown/prose/state'
import { AddMarkStep, ReplaceStep } from '@milkdown/prose/transform'
import { $prose } from '@milkdown/utils'

import { withMeta } from '../__internal__'
import { hardbreakSchema } from '../node'

/// This plugin is used to clear the marks around the hardbreak node.
export const hardbreakClearMarkPlugin = $prose((ctx) => {
  return new Plugin({
    key: new PluginKey('MILKDOWN_HARDBREAK_MARKS'),
    appendTransaction: (trs, _oldState, newState) => {
      if (!trs.length) return

      const [tr] = trs
      if (!tr) return

      const [step] = tr.steps

      // The step's positions refer to the document right after it. Map them
      // through every later step, so they point into newState.doc.
      const toNewDoc = (pos: number, assoc: number) =>
        trs.reduce(
          (mapped, t, i) =>
            (i === 0 ? t.mapping.slice(1) : t.mapping).map(mapped, assoc),
          pos
        )

      const isInsertHr = tr.getMeta('hardbreak')
      if (isInsertHr) {
        if (!(step instanceof ReplaceStep)) return

        const from = toNewDoc((step as unknown as { from: number }).from, 1)
        const node = newState.doc.nodeAt(from)
        if (node?.type !== hardbreakSchema.type(ctx)) return
        return newState.tr.setNodeMarkup(
          from,
          hardbreakSchema.type(ctx),
          node.attrs,
          []
        )
      }

      const isAddMarkStep = step instanceof AddMarkStep
      if (isAddMarkStep) {
        let _tr = newState.tr
        const range = step as unknown as { from: number; to: number }
        const from = toNewDoc(range.from, -1)
        const to = toNewDoc(range.to, 1)
        newState.doc.nodesBetween(from, to, (node, pos) => {
          if (node.type === hardbreakSchema.type(ctx))
            _tr = _tr.setNodeMarkup(
              pos,
              hardbreakSchema.type(ctx),
              node.attrs,
              []
            )
        })

        return _tr
      }

      return undefined
    },
  })
})

withMeta(hardbreakClearMarkPlugin, {
  displayName: 'Prose<hardbreakClearMarkPlugin>',
  group: 'Prose',
})
