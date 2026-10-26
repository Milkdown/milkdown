import { commandsCtx, editorViewCtx } from '@milkdown/core'
import { splitListItemCommand } from '@milkdown/preset-commonmark'
import { TextSelection } from '@milkdown/prose/state'
import { getMarkdown } from '@milkdown/utils'
import { describe, expect, it } from 'vitest'

import { withEditor } from './test-utils'

/// Put the caret at the end of the text `text` and press Enter `times`
/// times. Return the attrs of the list item at the caret and the markdown.
function splitAtEndOf(markdown: string, text: string, times: number) {
  return withEditor(markdown, (editor) =>
    editor.action((ctx) => {
      const view = ctx.get(editorViewCtx)
      let end = -1
      view.state.doc.descendants((node, pos) => {
        if (node.isText && node.text === text) end = pos + node.nodeSize
      })
      view.dispatch(
        view.state.tr.setSelection(TextSelection.create(view.state.doc, end))
      )
      const commands = ctx.get(commandsCtx)
      for (let i = 0; i < times; i++) commands.call(splitListItemCommand.key)

      const { $from } = view.state.selection
      return {
        attrs: $from.node(-1).attrs,
        depth: $from.depth,
        markdown: getMarkdown()(ctx),
      }
    })
  )
}

// https://github.com/Milkdown/milkdown/issues/2499
describe('split an empty nested task item (#2499)', () => {
  it('should keep the task type when the empty item moves out', async () => {
    const { attrs, depth, markdown } = await splitAtEndOf(
      '* [ ] outer\n  * [ ] inner\n',
      'inner',
      2
    )
    expect(depth).toBe(3)
    expect(attrs.checked).toBe(false)
    expect(markdown).toBe('* [ ] outer\n  * [ ] inner\n* [ ] <br />\n')
  })

  it('should keep the ordered label when the empty item moves out', async () => {
    const { attrs, markdown } = await splitAtEndOf(
      '1. outer\n   1. inner\n',
      'inner',
      2
    )
    expect(attrs.listType).toBe('ordered')
    expect(attrs.label).toBe('2.')
    expect(markdown).toBe('1. outer\n   1. inner\n2. <br />\n')
  })
})
