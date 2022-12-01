/* Copyright 2021, Milkdown by Mirone. */
import { $inputRule, $nodeSchema, $remark } from '@milkdown/utils'
import remarkMath from 'remark-math'

import { InputRule } from '@milkdown/prose/inputrules'
import { NodeSelection } from '@milkdown/prose/state'
import type { MilkdownPlugin } from '@milkdown/core'

export const remarkMathPlugin = $remark(() => remarkMath)

const mathInlineId = 'math_inline'
export const mathInlineSchema = $nodeSchema('math_inline', () => ({
  group: 'inline',
  inline: true,
  atom: true,
  attrs: {
    value: {
      default: '',
    },
  },
  parseDOM: [{ tag: `span[data-type="${mathInlineId}"]` }],
  toDOM: node => ['span', { 'data-type': mathInlineId, 'data-value': node.attrs.value }],
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
export const mathBlockSchema = $nodeSchema('math_block', () => ({
  content: 'text*',
  group: 'block',
  marks: '',
  defining: true,
  atom: true,
  code: true,
  isolating: true,
  parseDOM: [
    {
      tag: `div[data-type="${mathBlockId}"]`,
      preserveWhitespace: 'full',
    },
  ],
  toDOM: () => ['div', { 'data-type': mathBlockId }, 0],
  parseMarkdown: {
    match: ({ type }) => type === 'math',
    runner: (state, node, type) => {
      const value = node.value as string
      state.openNode(type)
      if (value)
        state.addText(value)

      state.closeNode()
    },
  },
  toMarkdown: {
    match: node => node.type.name === mathBlockId,
    runner: (state, node) => {
      let text = ''
      node.forEach((n) => {
        text += n.text as string
      })
      state.addNode('math', undefined, text)
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

export const math: MilkdownPlugin[] = [remarkMathPlugin, mathInlineSchema, mathBlockSchema, mathBlockInputRule].flat()
