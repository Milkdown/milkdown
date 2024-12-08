import { Plugin, PluginKey } from '@milkdown/prose/state'
import { AddMarkStep, ReplaceStep } from '@milkdown/prose/transform'
import { $prose } from '@milkdown/utils'
import { hardbreakSchema } from '../node'
import { withMeta } from '../__internal__'

/// This plugin is used to clear the marks around the hardbreak node.
export const hardbreakClearMarkPlugin = $prose((ctx) => {
  return new Plugin({
    key: new PluginKey('MILKDOWN_HARDBREAK_MARKS'),
    appendTransaction: (trs, _oldState, newState) => {
      if (!trs.length) return

      const [tr] = trs
      if (!tr) return

      const [step] = tr.steps

      const isInsertHr = tr.getMeta('hardbreak')
      if (isInsertHr) {
        if (!(step instanceof ReplaceStep)) return

        const { from } = step as unknown as { from: number }
        return newState.tr.setNodeMarkup(
          from,
          hardbreakSchema.type(ctx),
          undefined,
          []
        )
      }

      const isAddMarkStep = step instanceof AddMarkStep
      if (isAddMarkStep) {
        let _tr = newState.tr
        const { from, to } = step as unknown as { from: number; to: number }
        newState.doc.nodesBetween(from, to, (node, pos) => {
          if (node.type === hardbreakSchema.type(ctx))
            _tr = _tr.setNodeMarkup(
              pos,
              hardbreakSchema.type(ctx),
              undefined,
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
