import type { NodeViewConstructor } from '@milkdown/prose/view'

import { codeBlockSchema } from '@milkdown/preset-commonmark'
import { $view } from '@milkdown/utils'

import { withMeta } from '../../__internal__/meta'
import { codeBlockConfig } from '../config'
import { LanguageLoader } from './loader'
import { CodeMirrorBlock } from './node-view'

export const codeBlockView = $view(
  codeBlockSchema.node,
  (ctx): NodeViewConstructor => {
    const config = ctx.get(codeBlockConfig.key)
    const languageLoader = new LanguageLoader(config.languages)
    return (node, view, getPos) =>
      new CodeMirrorBlock(node, view, getPos, languageLoader, config)
  }
)

withMeta(codeBlockView, {
  displayName: 'NodeView<code-block>',
  group: 'CodeBlock',
})
