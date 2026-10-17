import { editorViewCtx, schemaCtx } from '@milkdown/core'
import { AllSelection, TextSelection } from '@milkdown/prose/state'
import { callCommand, getMarkdown } from '@milkdown/utils'
import { describe, expect, it } from 'vitest'

import { insertHardbreakCommand, toggleStrongCommand } from '..'
import { withEditor } from './test-utils'

// https://github.com/Milkdown/milkdown/issues/2493
describe('hardbreakClearMarkPlugin (#2493)', () => {
  it('keeps a soft break soft when a mark is applied across it', async () => {
    const output = await withEditor('line one\nline two\n', (editor) =>
      editor.action((ctx) => {
        const view = ctx.get(editorViewCtx)
        view.dispatch(
          view.state.tr.setSelection(new AllSelection(view.state.doc))
        )
        callCommand(toggleStrongCommand.key)(ctx)
        return getMarkdown()(ctx)
      })
    )

    expect(output).toBe('**line one**\n**line two**\n')
  })

  it('clears the mark of a hard break that a later step moves', async () => {
    const marks = await withEditor('a\\\nb\n', (editor) =>
      editor.action((ctx) => {
        const view = ctx.get(editorViewCtx)
        const strong = ctx.get(schemaCtx).marks.strong!.create()
        view.dispatch(view.state.tr.addMark(1, 4, strong).insertText('xxx', 1))

        const found: string[][] = []
        view.state.doc.descendants((node) => {
          if (node.type.name === 'hardbreak')
            found.push(node.marks.map((mark) => mark.type.name))
        })
        return found
      })
    )

    expect(marks).toEqual([[]])
  })

  it('inserts a hard break without the marks around it', async () => {
    const breaks = await withEditor('**ab**\n', (editor) =>
      editor.action((ctx) => {
        const view = ctx.get(editorViewCtx)
        view.dispatch(
          view.state.tr.setSelection(TextSelection.create(view.state.doc, 2))
        )
        callCommand(insertHardbreakCommand.key)(ctx)

        const found: { marks: string[]; isInline: unknown }[] = []
        view.state.doc.descendants((node) => {
          if (node.type.name === 'hardbreak')
            found.push({
              marks: node.marks.map((mark) => mark.type.name),
              isInline: node.attrs.isInline,
            })
        })
        return found
      })
    )

    expect(breaks).toEqual([{ marks: [], isInline: false }])
  })
})
