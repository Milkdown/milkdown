import type { Node } from '@milkdown/prose/model'

import { editorViewCtx, schemaCtx } from '@milkdown/core'
import { AllSelection, TextSelection } from '@milkdown/prose/state'
import { callCommand, getMarkdown } from '@milkdown/utils'
import { describe, expect, it } from 'vitest'

import { insertHardbreakCommand, toggleStrongCommand } from '..'
import { withEditor } from './test-utils'

function collectBreaks(doc: Node) {
  const found: { marks: string[]; isInline: boolean }[] = []
  doc.descendants((node) => {
    if (node.type.name === 'hardbreak')
      found.push({
        marks: node.marks.map((mark) => mark.type.name),
        isInline: node.attrs.isInline,
      })
  })
  return found
}

// https://github.com/Milkdown/milkdown/issues/2493
describe('hardbreakClearMarkPlugin (#2493)', () => {
  it('keeps a soft break soft and marked when a mark is applied across it', async () => {
    const result = await withEditor('line one\nline two\n', (editor) =>
      editor.action((ctx) => {
        const view = ctx.get(editorViewCtx)
        view.dispatch(
          view.state.tr.setSelection(new AllSelection(view.state.doc))
        )
        callCommand(toggleStrongCommand.key)(ctx)
        return {
          markdown: getMarkdown()(ctx),
          breaks: collectBreaks(view.state.doc),
        }
      })
    )

    expect(result.markdown).toBe('**line one\nline two**\n')
    expect(result.breaks).toEqual([{ marks: ['strong'], isInline: true }])
  })

  it('clears the mark of a hard break when a mark is applied across it', async () => {
    const result = await withEditor('line one\\\nline two\n', (editor) =>
      editor.action((ctx) => {
        const view = ctx.get(editorViewCtx)
        view.dispatch(
          view.state.tr.setSelection(new AllSelection(view.state.doc))
        )
        callCommand(toggleStrongCommand.key)(ctx)
        return {
          markdown: getMarkdown()(ctx),
          breaks: collectBreaks(view.state.doc),
        }
      })
    )

    expect(result.markdown).toBe('**line one**\\\n**line two**\n')
    expect(result.breaks).toEqual([{ marks: [], isInline: false }])
  })

  it('clears the marks of hard breaks in every paragraph of the selection', async () => {
    // `toggleMark` emits one `AddMarkStep` per paragraph, so the plugin
    // must look at every step and not only the first one.
    const breaks = await withEditor('a\\\nb\n\nc\\\nd\n', (editor) =>
      editor.action((ctx) => {
        const view = ctx.get(editorViewCtx)
        view.dispatch(
          view.state.tr.setSelection(new AllSelection(view.state.doc))
        )
        callCommand(toggleStrongCommand.key)(ctx)
        return collectBreaks(view.state.doc)
      })
    )

    expect(breaks).toEqual([
      { marks: [], isInline: false },
      { marks: [], isInline: false },
    ])
  })

  it('clears the mark of a hard break that a later step moves', async () => {
    const breaks = await withEditor('a\\\nb\n', (editor) =>
      editor.action((ctx) => {
        const view = ctx.get(editorViewCtx)
        const strong = ctx.get(schemaCtx).marks.strong!.create()
        view.dispatch(view.state.tr.addMark(1, 4, strong).insertText('xxx', 1))
        return collectBreaks(view.state.doc)
      })
    )

    expect(breaks).toEqual([{ marks: [], isInline: false }])
  })

  it('clears the mark of a hard break when the mark step is not the first step', async () => {
    const breaks = await withEditor('a\\\nb\n', (editor) =>
      editor.action((ctx) => {
        const view = ctx.get(editorViewCtx)
        const strong = ctx.get(schemaCtx).marks.strong!.create()
        view.dispatch(view.state.tr.insertText('x', 1).addMark(1, 5, strong))
        return collectBreaks(view.state.doc)
      })
    )

    expect(breaks).toEqual([{ marks: [], isInline: false }])
  })

  it('inserts a hard break without the marks around it', async () => {
    const breaks = await withEditor('**ab**\n', (editor) =>
      editor.action((ctx) => {
        const view = ctx.get(editorViewCtx)
        view.dispatch(
          view.state.tr.setSelection(TextSelection.create(view.state.doc, 2))
        )
        callCommand(insertHardbreakCommand.key)(ctx)
        return collectBreaks(view.state.doc)
      })
    )

    expect(breaks).toEqual([{ marks: [], isInline: false }])
  })
})
