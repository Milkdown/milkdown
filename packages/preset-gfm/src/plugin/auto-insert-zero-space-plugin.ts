/* Copyright 2021, Milkdown by Mirone. */
import { browser } from '@milkdown/prose'
import type { Node } from '@milkdown/prose/model'
import { isInTable } from '@milkdown/prose/tables'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import { paragraphSchema } from '@milkdown/preset-commonmark'
import { $prose } from '@milkdown/utils'
import { withMeta } from '../__internal__'

/// This plugin is used to fix the bug of IME composing in table in Safari browser.
/// original discussion in https://discuss.prosemirror.net/t/ime-composing-problems-on-td-or-th-element-in-safari-browser/4501
export const autoInsertZeroSpaceInTablePlugin = $prose((ctx) => {
  const pluginKey = new PluginKey('MILKDOWN_AUTO_INSERT_ZERO_SPACE')

  const isParagraph = (node: Node) => node.type === paragraphSchema.type(ctx)

  const isEmptyParagraph = (node: Node) => isParagraph(node) && node.nodeSize === 2

  return new Plugin({
    key: pluginKey,
    props: {
      handleDOMEvents: {
        compositionstart(view) {
          const { state, dispatch } = view
          const { tr, selection } = state
          const { $from } = selection
          if (browser.safari && isInTable(state) && selection.empty && isEmptyParagraph($from.parent))
            dispatch(tr.insertText('\u2060', $from.start()))

          return false
        },
        compositionend(view) {
          const { state, dispatch } = view
          const { tr, selection } = state
          const { $from } = selection

          if (
            browser.safari
              && isInTable(state)
              && selection.empty
              && isParagraph($from.parent)
              && $from.parent.textContent.startsWith('\u2060')
          )
            dispatch(tr.delete($from.start(), $from.start() + 1))

          return false
        },
      },
    },
  })
})

withMeta(autoInsertZeroSpaceInTablePlugin, {
  displayName: 'Prose<autoInsertZeroSpaceInTablePlugin>',
  group: 'Prose',
})
