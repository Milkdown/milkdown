import { $ctx, $inputRule, $nodeSchema, $remark } from '@milkdown/utils'
import type { KatexOptions } from 'katex'
import katex from 'katex'
import remarkMath from 'remark-math'

import type { Meta, MilkdownPlugin } from '@milkdown/ctx'
import { Fragment } from '@milkdown/prose/model'
import { InputRule } from '@milkdown/prose/inputrules'
import { expectDomTypeError } from '@milkdown/exception'
import { nodeRule } from '@milkdown/prose'

function withMeta<T extends MilkdownPlugin>(plugin: T, meta: Partial<Meta> & Pick<Meta, 'displayName'>): T {
  Object.assign(plugin, {
    meta: {
      package: '@milkdown/plugin-math',
      ...meta,
    },
  })

  return plugin
}

/// This plugin wraps [remark-math](https://www.npmjs.com/package/remark-math).
export const remarkMathPlugin = $remark<'remarkMath', undefined>('remarkMath', () => remarkMath)

withMeta(remarkMathPlugin.plugin, {
  displayName: 'Remark<remarkMath>',
})

withMeta(remarkMathPlugin.options, {
  displayName: 'RemarkConfig<remarkMath>',
})

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

withMeta(katexOptionsCtx, {
  displayName: 'Ctx<katexOptions>',
})

/// Schema for inline math node.
/// Add support for:
///
/// ```markdown
/// $a^2 + b^2 = c^2$
/// ```
export const mathInlineSchema = $nodeSchema('math_inline', ctx => ({
  group: 'inline',
  content: 'text*',
  inline: true,
  atom: true,
  parseDOM: [
    {
      tag: `span[data-type="${mathInlineId}"]`,
      getContent: (dom, schema) => {
        if (!(dom instanceof HTMLElement))
          throw expectDomTypeError(dom)

        return Fragment.from(schema.text(dom.dataset.value ?? ''))
      },
    },
  ],
  toDOM: (node) => {
    const code: string = node.textContent
    const dom = document.createElement('span')
    dom.dataset.type = mathInlineId
    dom.dataset.value = code
    katex.render(code, dom, ctx.get(katexOptionsCtx.key))

    return dom
  },
  parseMarkdown: {
    match: node => node.type === 'inlineMath',
    runner: (state, node, type) => {
      state.openNode(type)
        .addText(node.value as string)
        .closeNode()
    },
  },
  toMarkdown: {
    match: node => node.type.name === mathInlineId,
    runner: (state, node) => {
      state.addNode('inlineMath', undefined, node.textContent)
    },
  },
}))

withMeta(mathInlineSchema.ctx, {
  displayName: 'NodeSchemaCtx<mathInline>',
})
withMeta(mathInlineSchema.node, {
  displayName: 'NodeSchema<mathInline>',
})

/// Input rule for inline math.
/// When you type $E=MC^2$, it will create an inline math node.
export const mathInlineInputRule = $inputRule(ctx =>
  nodeRule(/(?:\$)([^$]+)(?:\$)$/, mathInlineSchema.type(ctx), {
    beforeDispatch: ({ tr, match, start }) => {
      tr.insertText(match[1] ?? '', start + 1)
    },
  }),
)

withMeta(mathInlineInputRule, {
  displayName: 'InputRule<mathInline>',
})

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
        return { value: dom.dataset.value ?? '' }
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

withMeta(mathBlockSchema.ctx, {
  displayName: 'NodeSchemaCtx<mathBlock>',
})
withMeta(mathBlockSchema.node, {
  displayName: 'NodeSchema<mathBlock>',
})

/// Input rule for math block.
/// When you type `$$` and press enter, it will create a math block.
export const mathBlockInputRule = $inputRule(ctx => new InputRule(
  /^\$\$\s$/,
  (state, _match, start, end) => {
    const $start = state.doc.resolve(start)
    if (!$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), mathBlockSchema.type(ctx)))
      return null
    return state.tr.delete(start, end).setBlockType(start, start, mathBlockSchema.type(ctx))
  },
))
withMeta(mathBlockInputRule, {
  displayName: 'InputRule<mathBlock>',
})

/// All plugins exported by this package.
export const math: MilkdownPlugin[] = [remarkMathPlugin, katexOptionsCtx, mathInlineSchema, mathBlockSchema, mathBlockInputRule, mathInlineInputRule].flat()
