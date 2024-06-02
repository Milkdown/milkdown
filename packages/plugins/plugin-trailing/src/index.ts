import type { MilkdownPlugin } from '@milkdown/ctx'
import type { Node } from '@milkdown/prose/model'
import type { EditorState } from '@milkdown/prose/state'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import { $ctx, $prose } from '@milkdown/utils'

/// Options for trailing config.
export interface TrailingConfigOptions {
  /// A function that returns a boolean value.
  /// If it returns `true`, the plugin will append a node at the end of the document.
  /// By default, it returns `false` if the last node is a heading or a paragraph.
  shouldAppend: (lastNode: Node | null, state: EditorState) => boolean
  /// A function that returns a node.
  /// By default, it returns a paragraph node.
  getNode: (state: EditorState) => Node
}

/// A slice contains the trailing config.
/// You can use [TrailingConfigOptions](#TrailingConfigOptions) to customize the behavior of the plugin.
export const trailingConfig = $ctx<TrailingConfigOptions, 'trailingConfig'>({
  shouldAppend: (lastNode) => {
    if (!lastNode)
      return false

    if (['heading', 'paragraph'].includes(lastNode.type.name))
      return false

    return true
  },
  getNode: state => state.schema.nodes.paragraph!.create(),
}, 'trailingConfig')

trailingConfig.meta = {
  package: '@milkdown/plugin-trailing',
  displayName: 'Ctx<trailingConfig>',
}

/// The prosemirror plugin for trailing.
export const trailingPlugin = $prose((ctx) => {
  const trailingPluginKey = new PluginKey('MILKDOWN_TRAILING')
  const { shouldAppend, getNode } = ctx.get(trailingConfig.key)
  const plugin = new Plugin({
    key: trailingPluginKey,
    state: {
      init: (_, state) => {
        const lastNode = state.tr.doc.lastChild

        return shouldAppend(lastNode, state)
      },
      apply: (tr, value, _, state) => {
        if (!tr.docChanged)
          return value

        const lastNode = tr.doc.lastChild

        return shouldAppend(lastNode, state)
      },
    },
    appendTransaction: (_, __, state) => {
      const { doc, tr } = state
      const nodeType = getNode?.(state)
      const shouldInsertNodeAtEnd = plugin.getState(state)
      const endPosition = doc.content.size

      if (!shouldInsertNodeAtEnd || !nodeType)
        return

      return tr.insert(endPosition, nodeType)
    },
  })

  return plugin
})

trailingPlugin.meta = {
  package: '@milkdown/plugin-trailing',
  displayName: 'Prose<trailing>',
}

/// All plugins exported by this package.
export const trailing: MilkdownPlugin[] = [trailingConfig, trailingPlugin]
