import '@testing-library/jest-dom/vitest'
import type { Node } from '@milkdown/kit/prose/model'

import { editorViewCtx } from '@milkdown/kit/core'
import { NodeSelection } from '@milkdown/kit/prose/state'
import { afterEach, describe, expect, test } from 'vitest'

import { Crepe } from '../../../core'
import { mathInlineId } from '../inline-latex'

function waitForAsync() {
  return new Promise<void>((resolve) => setTimeout(resolve, 0))
}

function findMathInlinePos(doc: Node) {
  let pos: number | undefined
  doc.descendants((node, currentPos) => {
    if (node.type.name === mathInlineId) {
      pos = currentPos
      return false
    }
    return true
  })
  return pos
}

describe('latex inline tooltip', () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  test('should show in edit mode', async () => {
    const crepe = new Crepe({
      defaultValue: '$x$',
    })

    await crepe.create()

    const view = crepe.editor.ctx.get(editorViewCtx)
    const pos = findMathInlinePos(view.state.doc)
    expect(pos).toBeTypeOf('number')

    view.dispatch(
      view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos!))
    )
    await waitForAsync()

    expect(view.state.selection).toBeInstanceOf(NodeSelection)
    expect((view.state.selection as NodeSelection).node.type.name).toBe(
      mathInlineId
    )
    expect(
      document.body.querySelector('.milkdown-latex-inline-edit')
    ).toHaveAttribute('data-show', 'true')
  })

  test('should not show in readonly editor', async () => {
    const crepe = new Crepe({
      defaultValue: '$x$',
    }).setReadonly(true)

    await crepe.create()

    const view = crepe.editor.ctx.get(editorViewCtx)
    const pos = findMathInlinePos(view.state.doc)
    expect(pos).toBeTypeOf('number')

    view.dispatch(
      view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos!))
    )
    await waitForAsync()

    expect(view.state.selection).toBeInstanceOf(NodeSelection)
    expect((view.state.selection as NodeSelection).node.type.name).toBe(
      mathInlineId
    )
    expect(
      document.body.querySelector('.milkdown-latex-inline-edit')
    ).toHaveAttribute('data-show', 'false')
  })
})
