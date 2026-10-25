import type { NodeViewConstructor } from '@milkdown/prose/view'

import { codeBlockSchema } from '@milkdown/preset-commonmark'
import { $view } from '@milkdown/utils'

import { withMeta } from '../../__internal__/meta'
import { codeBlockConfig } from '../config'
import { LanguageLoader } from './loader'
import { CodeMirrorBlock } from './node-view'

export { CodeMirrorBlock }

export const codeBlockView = $view(
  codeBlockSchema.node,
  (ctx): NodeViewConstructor => {
    const configSlice = ctx.use(codeBlockConfig.key)
    const languageLoader = new LanguageLoader(configSlice.get().languages)
    return (node, view, getPos) =>
      new CodeMirrorBlock(
        node,
        view,
        getPos,
        languageLoader,
        configSlice.get(),
        (watcher) => configSlice.on(watcher)
      )
  }
)

withMeta(codeBlockView, {
  displayName: 'NodeView<code-block>',
  group: 'CodeBlock',
})
