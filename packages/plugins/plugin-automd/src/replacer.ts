import type { Ctx } from '@milkdown/ctx'
import type { Attrs } from '@milkdown/prose/model'
import type { EditorState, PluginKey, Transaction } from '@milkdown/prose/state'
import { TextSelection } from '@milkdown/prose/state'

import { inlineSyncConfig } from './config'
import { getContextByState } from './context'
import { calcOffset } from './utils'
import { linkRegexp } from './regexp'

export function runReplacer(
  ctx: Ctx,
  key: PluginKey,
  state: EditorState,
  dispatch: (tr: Transaction) => void,
  attrs: Attrs
) {
  const { placeholderConfig } = ctx.get(inlineSyncConfig.key)
  const holePlaceholder = placeholderConfig.hole
  // insert a placeholder to restore the selection
  let tr = state.tr
    .setMeta(key, true)
    .insertText(holePlaceholder, state.selection.from)

  const nextState = state.apply(tr)
  const context = getContextByState(ctx, nextState)

  if (!context) return

  const lastUserInput = context.text.slice(
    0,
    context.text.indexOf(context.placeholder)
  )

  const { $from } = nextState.selection
  const from = $from.before()
  const to = $from.after()

  const offset = calcOffset(context.nextNode, from, context.placeholder)

  tr = tr
    .replaceWith(from, to, context.nextNode)
    .setNodeMarkup(from, undefined, attrs)
    // delete the placeholder
    .delete(offset + 1, offset + 2)

  // restore the selection
  tr = tr.setSelection(TextSelection.near(tr.doc.resolve(offset + 1)))

  const needsRestoreMark =
    linkRegexp.test(lastUserInput) ||
    ['*', '_', '~'].includes(lastUserInput.at(-1) || '')
  if (needsRestoreMark && tr.selection instanceof TextSelection) {
    const marks = tr.selection.$cursor?.marks() ?? []
    marks.forEach((mark) => {
      tr = tr.removeStoredMark(mark.type)
    })
  }

  dispatch(tr)
}
