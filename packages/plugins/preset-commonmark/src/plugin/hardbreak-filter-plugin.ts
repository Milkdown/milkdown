import { Plugin, PluginKey } from '@milkdown/prose/state'
import { $ctx, $prose } from '@milkdown/utils'
import { withMeta } from '../__internal__'

/// This slice contains the nodes that within which the hardbreak will be ignored.
export const hardbreakFilterNodes = $ctx(
  ['table', 'code_block'],
  'hardbreakFilterNodes'
)

withMeta(hardbreakFilterNodes, {
  displayName: 'Ctx<hardbreakFilterNodes>',
  group: 'Prose',
})

/// This plugin is used to filter the hardbreak node.
/// If the hardbreak is going to be inserted within a node that is in the `hardbreakFilterNodes`, ignore it.
export const hardbreakFilterPlugin = $prose((ctx) => {
  const notIn = ctx.get(hardbreakFilterNodes.key)
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
          if (notIn.includes($from.node(curDepth).type.name)) canApply = false

          curDepth--
        }
        return canApply
      }
      return true
    },
  })
})

withMeta(hardbreakFilterPlugin, {
  displayName: 'Prose<hardbreakFilterPlugin>',
  group: 'Prose',
})
