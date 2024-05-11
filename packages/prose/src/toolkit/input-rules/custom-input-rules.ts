import type { InputRule } from '../../inputrules'
import type { EditorState, TextSelection, Transaction } from '../../state'
import { Plugin, PluginKey } from '../../state'
import type { EditorView } from '../../view'

function run(view: EditorView, from: number, to: number, text: string, rules: InputRule[], plugin: Plugin) {
  if (view.composing)
    return false
  const state = view.state
  const $from = state.doc.resolve(from)
  if ($from.parent.type.spec.code)
    return false
  const textBefore
        = $from.parent.textBetween(Math.max(0, $from.parentOffset - 500), $from.parentOffset, undefined, '\uFFFC') + text
  for (let i = 0; i < rules.length; i++) {
    const match = (rules[i] as { match: RegExp }).match.exec(textBefore)
    const tr
            = match
            && match[0]
            && (
              rules[i] as { handler: (state: EditorState, match: string[], from: number, to: number) => Transaction }
            ).handler(state, match, from - (match[0].length - text.length), to)
    if (!tr)
      continue
    view.dispatch(tr.setMeta(plugin, { transform: tr, from, to, text }))
    return true
  }
  return false
}

export const customInputRulesKey = new PluginKey('MILKDOWN_CUSTOM_INPUTRULES')
export function customInputRules({ rules }: { rules: InputRule[] }): Plugin {
  const plugin: Plugin = new Plugin({
    key: customInputRulesKey,
    isInputRules: true,

    state: {
      init() {
        return null
      },
      apply(this: typeof plugin, tr, prev) {
        const stored = tr.getMeta(this)
        if (stored)
          return stored
        return (tr.selectionSet || tr.docChanged) ? null : prev
      },
    },
    props: {
      handleTextInput(view, from, to, text) {
        return run(view, from, to, text, rules, plugin)
      },
      handleDOMEvents: {
        compositionend: (view) => {
          setTimeout(() => {
            const { $cursor } = view.state.selection as TextSelection
            if ($cursor)
              run(view, $cursor.pos, $cursor.pos, '', rules, plugin)
          })
          return false
        },
      },
      handleKeyDown(view, event) {
        if (event.key !== 'Enter')
          return false
        const { $cursor } = view.state.selection as TextSelection
        if ($cursor)
          return run(view, $cursor.pos, $cursor.pos, '\n', rules, plugin)
        return false
      },
    },
  })
  return plugin
}
