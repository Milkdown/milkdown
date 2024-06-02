import type { MilkdownPlugin } from '@milkdown/ctx'
import type { Transaction } from '@milkdown/prose/state'
import { AllSelection, TextSelection } from '@milkdown/prose/state'
import { $ctx, $shortcut } from '@milkdown/utils'

/// Add indent config.
export interface IndentConfigOptions {
  /// The type of indent, `space` or `tab`. By default, it's `space`.
  type: 'space' | 'tab'
  /// The size of indent. By default, it's `2`.
  size: number
}

function updateIndent(tr: Transaction, options: IndentConfigOptions): Transaction {
  const { doc, selection } = tr

  if (!doc || !selection)
    return tr

  if (!(selection instanceof TextSelection || selection instanceof AllSelection))
    return tr

  const { to } = selection

  const text = options.type === 'space' ? Array(options.size).fill(' ').join('') : '\t'

  return tr.insertText(text, to)
}

/// A slice contains the indent config.
/// You can use [IndentConfigOptions](#IndentConfigOptions) to customize the behavior of the plugin.
///
/// ```ts
/// import { indent, indentConfig } from '@milkdown/plugin-indent'
///
/// Editor
///   .make()
///   .config((ctx) => {
///     ctx.set(indentConfig.key, {
///       type: 'space',
///       size: 4,
///     })
///   })
/// ```
export const indentConfig = $ctx<IndentConfigOptions, 'indentConfig'>({ type: 'space', size: 2 }, 'indentConfig')

indentConfig.meta = {
  package: '@milkdown/plugin-indent',
  displayName: 'Ctx<indentConfig>',
}

/// Add indent shortcut, when users press `Tab`, the plugin will insert indent text.
export const indentPlugin = $shortcut(ctx => ({
  Tab: (state, dispatch) => {
    const config = ctx.get(indentConfig.key)
    const { tr } = state
    const _tr = updateIndent(tr, config)

    if (_tr.docChanged) {
      dispatch?.(_tr)
      return true
    }

    return false
  },
}))

indentPlugin.meta = {
  package: '@milkdown/plugin-indent',
  displayName: 'Shortcut<indent>',
}

/// The plugin of indent.
export const indent: MilkdownPlugin[] = [indentConfig, indentPlugin]
