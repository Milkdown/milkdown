/* Copyright 2021, Milkdown by Mirone. */
import { Plugin, PluginKey } from '@milkdown/prose/state'
import { Decoration, DecorationSet } from '@milkdown/prose/view'

const inlineNodesCursorPluginKey = new PluginKey('MILKDOWN_INLINE_NODES_CURSOR')

/**
 * This plugin is to solve the chrome 98 bug:
 * https://discuss.prosemirror.net/t/cursor-jumps-at-the-end-of-line-when-it-betweens-two-inline-nodes/4641
 */
export const getInlineNodesCursorPlugin = (): Plugin => {
  let lock = false
  const inlineNodesCursorPlugin: Plugin = new Plugin({
    key: inlineNodesCursorPluginKey,
    state: {
      init() {
        return false
      },
      apply(tr) {
        if (!tr.selection.empty)
          return false

        const pos = tr.selection.$from
        const left = pos.nodeBefore
        const right = pos.nodeAfter
        if (left && right && left.isInline && !left.isText && right.isInline && !right.isText)
          return true

        return false
      },
    },
    props: {
      handleDOMEvents: {
        compositionend: (view, e) => {
          if (lock) {
            lock = false
            requestAnimationFrame(() => {
              const active = inlineNodesCursorPlugin.getState(view.state)
              if (active) {
                const from = view.state.selection.from
                e.preventDefault()
                view.dispatch(view.state.tr.insertText(e.data || '', from))
              }
            })

            return true
          }
          return false
        },
        compositionstart: (view) => {
          const active = inlineNodesCursorPlugin.getState(view.state)
          if (active)
            lock = true

          return false
        },
        beforeinput: (view, e) => {
          const active = inlineNodesCursorPlugin.getState(view.state)
          if (active && e instanceof InputEvent && e.data && !lock) {
            const from = view.state.selection.from
            e.preventDefault()
            view.dispatch(view.state.tr.insertText(e.data || '', from))

            return true
          }

          return false
        },
      },
      decorations(state) {
        const active = inlineNodesCursorPlugin.getState(state)
        if (active) {
          const pos = state.selection.$from
          const position = pos.pos
          const left = document.createElement('span')
          const leftDec = Decoration.widget(position, left, {
            side: -1,
          })
          const right = document.createElement('span')
          const rightDec = Decoration.widget(position, right)
          setTimeout(() => {
            left.contentEditable = 'true'
            right.contentEditable = 'true'
          })
          return DecorationSet.create(state.doc, [leftDec, rightDec])
        }
        return DecorationSet.empty
      },
    },
  })

  return inlineNodesCursorPlugin
}
