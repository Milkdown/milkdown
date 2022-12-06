/* Copyright 2021, Milkdown by Mirone. */
import { $ctx, $inputRule, $nodeSchema, $remark } from '@milkdown/utils'
import remarkMath from 'remark-math'
import type { KatexOptions } from 'katex'
import katex from 'katex'

import { InputRule } from '@milkdown/prose/inputrules'
import { NodeSelection } from '@milkdown/prose/state'
import type { MilkdownPlugin } from '@milkdown/core'

export const remarkMathPlugin = $remark(() => remarkMath)

const mathInlineId = 'math_inline'

export const katexOptionsCtx = $ctx<KatexOptions, 'katexOptions'>({}, 'katexOptions')

export const mathInlineSchema = $nodeSchema('math_inline', ctx => ({
  group: 'inline',
  inline: true,
  atom: true,
  attrs: {
    value: {
      default: '',
    },
  },
  parseDOM: [{ tag: `span[data-type="${mathInlineId}"]` }],
  toDOM: (node) => {
    const code: string = node.attrs.value
    const dom = document.createElement('span')
    dom.dataset.type = mathInlineId
    dom.dataset.value = code
    katex.render(code, dom, ctx.get(katexOptionsCtx.key))

    return dom
  },
  parseMarkdown: {
    match: node => node.type === 'inlineMath',
    runner: (state, node, type) => {
      state.addNode(type, { value: node.value as string })
    },
  },
  toMarkdown: {
    match: node => node.type.name === mathInlineId,
    runner: (state, node) => {
      state.addNode('inlineMath', undefined, node.attrs.value)
    },
  },
}))

const mathBlockId = 'math_block'
export const mathBlockSchema = $nodeSchema('math_block', ctx => ({
  content: 'text*',
  group: 'block',
  marks: '',
  atom: true,
  isolating: true,
  attrs: {
    value: {
      default: '',
    },
  },
  parseDOM: [
    {
      tag: `div[data-type="${mathBlockId}"]`,
      preserveWhitespace: 'full',
      getAttrs: (dom) => {
        return { value: (dom as HTMLElement).dataset.value ?? '' }
      },
    },
  ],
  toDOM: (node) => {
    const code = node.attrs.value
    const dom = document.createElement('div')
    dom.dataset.type = mathBlockId
    dom.dataset.value = code
    katex.render(code, dom, ctx.get(katexOptionsCtx.key))
    return dom
  },
  parseMarkdown: {
    match: ({ type }) => type === 'math',
    runner: (state, node, type) => {
      const value = node.value as string
      state.addNode(type, { value })
    },
  },
  toMarkdown: {
    match: node => node.type.name === mathBlockId,
    runner: (state, node) => {
      state.addNode('math', undefined, node.attrs.value)
    },
  },
}))

export const mathBlockInputRule = $inputRule(() => new InputRule(
  /^\$\$\s$/,
  (state, _match, start, end) => {
    const $start = state.doc.resolve(start)
    if (!$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), mathBlockSchema.type()))
      return null
    const tr = state.tr.delete(start, end).setBlockType(start, start, mathBlockSchema.type())

    return tr.setSelection(NodeSelection.create(tr.doc, start - 1))
  },
))

export const math: MilkdownPlugin[] = [remarkMathPlugin, katexOptionsCtx, mathInlineSchema, mathBlockSchema, mathBlockInputRule].flat()
