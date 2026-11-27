import { $nodeSchema } from '@milkdown/kit/utils'
import katex from 'katex'

import { mathInlineId } from './constants'

export { mathInlineId }

// Drop the whitespace at the ends of inline math. The guard reads `$x $`
// and `$ x$` as text, and TeX ignores a space there. A whitespace right
// after a backslash stays, since `\ ` is a control space.
function trimMath(value: string) {
  const start = value.trimStart()
  const trimmed = start.trimEnd()

  // An odd number of backslashes at the end means the last one is not
  // escaped. `x\\ ` ends with a line break, not with a control space.
  let backslashes = 0
  while (trimmed[trimmed.length - 1 - backslashes] === '\\') backslashes++

  return backslashes % 2 ? start.slice(0, trimmed.length + 1) : trimmed
}

/// Schema for inline math node.
/// Add support for:
///
/// ```markdown
/// $a^2 + b^2 = c^2$
/// ```
export const mathInlineSchema = $nodeSchema(mathInlineId, () => ({
  group: 'inline',
  inline: true,
  draggable: true,
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
        return {
          value: (dom as HTMLElement).dataset.value ?? '',
        }
      },
    },
  ],
  toDOM: (node) => {
    const code: string = node.attrs.value
    const dom = document.createElement('span')
    dom.dataset.type = mathInlineId
    dom.dataset.value = code
    katex.render(code, dom, {
      throwOnError: false,
    })

    return dom
  },
  parseMarkdown: {
    match: (node) => node.type === 'inlineMath',
    runner: (state, node, type) => {
      state.addNode(type, { value: node.value as string })
    },
  },
  toMarkdown: {
    match: (node) => node.type.name === mathInlineId,
    runner: (state, node) => {
      // Math with nothing left is not written at all: `$$` at the start
      // of a line opens a math block.
      const value = trimMath(String(node.attrs.value ?? ''))
      if (value) state.addNode('inlineMath', undefined, value)
    },
  },
}))
