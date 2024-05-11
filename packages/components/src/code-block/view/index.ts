import { $view } from '@milkdown/utils'
import { codeBlockSchema } from '@milkdown/preset-commonmark'
import type { NodeViewConstructor } from '@milkdown/prose/view'
import { codeBlockConfig } from '../config'
import { withMeta } from '../../__internal__/meta'
import { defIfNotExists } from '../../__internal__/helper'
import { CodeMirrorBlock } from './node-view'
import { LanguageLoader } from './loader'
import { CodeElement } from './component'

defIfNotExists('milkdown-code-block', CodeElement)
export const codeBlockView = $view(codeBlockSchema.node, (ctx): NodeViewConstructor => {
  const config = ctx.get(codeBlockConfig.key)
  const languageLoader = new LanguageLoader(config.languages)
  return (node, view, getPos) => new CodeMirrorBlock(
    node,
    view,
    getPos,
    languageLoader,
    config,
  )
})

withMeta(codeBlockView, {
  displayName: 'NodeView<code-block>',
  group: 'CodeBlock',
})
