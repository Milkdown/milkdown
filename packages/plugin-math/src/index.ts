/* Copyright 2021, Milkdown by Mirone. */
import { $ctx, $inputRule, $nodeSchema, $remark } from '@milkdown/utils'
import type { KatexOptions } from 'katex'
import katex from 'katex'
import remarkMath from 'remark-math'

import type { MilkdownPlugin } from '@milkdown/ctx'
import { InputRule } from '@milkdown/prose/inputrules'

/// This plugin wraps [remark-math](https://www.npmjs.com/package/remark-math).
export const remarkMathPlugin = $remark(() => remarkMath)

const mathInlineId = 'math_inline'

/// A slice that contains [options for katex](https://katex.org/docs/options.html).
/// You can configure katex here.
/// ```ts
/// import { katexOptionsCtx } from '@milkdown/plugin-math'
///
/// Editor.make()
///   .config((ctx) => {
///     ctx.set(katexOptionsCtx.key, { /* some options */ });
///   })
/// ```
export const katexOptionsCtx = $ctx<KatexOptions, 'katexOptions'>({}, 'katexOptions')

/// Schema for inline math node.
/// Add support for:
///
/// ```markdown
/// $a^2 + b^2 = c^2$
/// ```
export const mathInlineSchema = $nodeSchema('math_inline', ctx => ({
  group: 'inline',
  inline: true,
  atom: true,
  attrs: {
    value: {
      default: '',
    },
  },
  parseDOM: [
    {
      tag: `span[data-type="${mathInlineId}"]`,
      getAttrs: (dom) => {
        return { value: (dom as HTMLElement).dataset.value ?? '' }
      },
    },
  ],
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
/// Schema for block math node.
/// Add support for:
///
/// ```markdown
/// $$
/// a^2 + b^2 = c^2
/// $$
/// ```
export const mathBlockSchema = $nodeSchema('math_block', ctx => ({
  content: 'text*',
  group: 'block',
  marks: '',
  defining: true,
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

/// Input rule for math block.
/// When you type `$$` and press enter, it will create a math block.
export const mathBlockInputRule = $inputRule(() => new InputRule(
  /^\$\$\s$/,
  (state, _match, start, end) => {
    const $start = state.doc.resolve(start)
    if (!$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), mathBlockSchema.type()))
      return null
    return state.tr.delete(start, end).setBlockType(start, start, mathBlockSchema.type())
  },
))

/// All plugins exported by this package.
export const math: MilkdownPlugin[] = [remarkMathPlugin, katexOptionsCtx, mathInlineSchema, mathBlockSchema, mathBlockInputRule].flat()
