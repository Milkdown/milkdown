/* Copyright 2021, Milkdown by Mirone. */
import { $view } from '@milkdown/utils'
import { codeBlockSchema } from '@milkdown/preset-commonmark'
import type { NodeViewConstructor } from '@milkdown/prose/view'
import { c } from 'atomico'
import { codeBlockConfig } from '../config'
import { codeComponent } from './component'
import { CodeMirrorBlock } from './node-view'

export const codeBlockView = $view(codeBlockSchema.node, (ctx): NodeViewConstructor => {
  const config = ctx.get(codeBlockConfig.key)
  customElements.define('milkdown-code-block', c(codeComponent))
  return (node, view, getPos) => new CodeMirrorBlock(
    node,
    view,
    getPos,
    config,
  )
})
