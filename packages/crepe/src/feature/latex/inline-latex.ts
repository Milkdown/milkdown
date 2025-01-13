import { Fragment } from '@milkdown/kit/prose/model'
import { $nodeSchema } from '@milkdown/kit/utils'
import katex from 'katex'

export const mathInlineId = 'math_inline'

/// Schema for inline math node.
/// Add support for:
///
/// ```markdown
/// $a^2 + b^2 = c^2$
/// ```
export const mathInlineSchema = $nodeSchema(mathInlineId, () => ({
  group: 'inline',
  content: 'text*',
  inline: true,
  atom: true,
  parseDOM: [
    {
      tag: `span[data-type="${mathInlineId}"]`,
      getContent: (dom, schema) => {
        return Fragment.from(schema.text((dom as HTMLElement).dataset.value ?? ''))
      },
    },
  ],
  toDOM: (node) => {
    const code: string = node.textContent
    const dom = document.createElement('span')
    dom.dataset.type = mathInlineId
    dom.dataset.value = code
    katex.render(code, dom)

    return dom
  },
  parseMarkdown: {
    match: (node) => node.type === 'inlineMath',
    runner: (state, node, type) => {
      state
        .openNode(type)
        .addText(node.value as string)
        .closeNode()
    },
  },
  toMarkdown: {
    match: (node) => node.type.name === mathInlineId,
    runner: (state, node) => {
      state.addNode('inlineMath', undefined, node.textContent)
    },
  },
}))
