import { InputRule } from '../../inputrules'
import type { NodeType } from '../../model'
import type { Captured, Options } from './common'

/// Create an input rule for a node.
export function nodeRule(
  regexp: RegExp,
  nodeType: NodeType,
  options: Options = {}
): InputRule {
  return new InputRule(regexp, (state, match, start, end) => {
    const { tr } = state
    let group: string | undefined = match[1]
    let fullMatch = match[0]

    const captured: Captured = {
      group,
      fullMatch,
      start,
      end,
    }

    const result = options.updateCaptured?.(captured)
    Object.assign(captured, result)
    ;({ group, fullMatch, start, end } = captured)

    if (fullMatch === null) return null

    if (!group || group.trim() === '') return null

    const attrs = options.getAttr?.(match)
    const node = nodeType.createAndFill(attrs)

    if (node) {
      tr.replaceRangeWith(
        nodeType.isBlock ? tr.doc.resolve(start).before() : start,
        end,
        node
      )
      options.beforeDispatch?.({
        match: [fullMatch, group ?? ''],
        start,
        end,
        tr,
      })
    }

    return tr
  })
}
