/* Copyright 2021, Milkdown by Mirone. */
import { Plugin, PluginKey } from '@milkdown/prose/state'
import { $ctx, $prose } from '@milkdown/utils'

export const hardbreakFilterNodes = $ctx(['table', 'code_block'], 'hardbreakFilterNodes')

// If the hardbreak is going to be inserted within a node that is in the `hardbreakFilterNodes`, ignore it.
export const hardbreakFilterPlugin = $prose((ctx) => {
  const notIn = ctx.get(hardbreakFilterNodes.slice)
  return new Plugin({
    key: new PluginKey('MILKDOWN_HARDBREAK_FILTER'),
    filterTransaction: (tr, state) => {
      const isInsertHr = tr.getMeta('hardbreak')
      const [step] = tr.steps
      if (isInsertHr && step) {
        const { from } = step as unknown as { from: number }
        const $from = state.doc.resolve(from)
        let curDepth = $from.depth
        let canApply = true
        while (curDepth > 0) {
          if (notIn.includes($from.node(curDepth).type.name))
            canApply = false

          curDepth--
        }
        return canApply
      }
      return true
    },
  })
})
