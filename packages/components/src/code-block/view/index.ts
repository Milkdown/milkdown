/* Copyright 2021, Milkdown by Mirone. */
import { $view } from '@milkdown/utils'
import { codeBlockSchema } from '@milkdown/preset-commonmark'
import type { NodeViewConstructor } from '@milkdown/prose/view'
import { c } from 'atomico'
import { codeBlockConfig } from '../config'
import { CodeMirrorBlock } from './node-view'
import { LanguageLoader } from './loader'
import { codeComponent } from './component'

export const codeBlockView = $view(codeBlockSchema.node, (ctx): NodeViewConstructor => {
  customElements.define('milkdown-code-block', c(codeComponent))
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
