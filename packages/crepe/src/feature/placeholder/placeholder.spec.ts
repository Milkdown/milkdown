import '@testing-library/jest-dom/vitest'
import { editorViewCtx } from '@milkdown/kit/core'
import { test, expect, describe } from 'vitest'

import { Crepe } from '../../core'

test('show placeholder in empty editor', async () => {
  const crepe = new Crepe()
  await crepe.create()

  const view = crepe.editor.ctx.get(editorViewCtx)
  expect(view.dom.querySelector('[data-placeholder]')).toBeInTheDocument()
})

describe('hide placeholder in readonly editor', () => {
  test('hide before create', async () => {
    const crepe = new Crepe()
    crepe.setReadonly(true)
    await crepe.create()

    const view = crepe.editor.ctx.get(editorViewCtx)
    expect(view.dom.querySelector('[data-placeholder]')).not.toBeInTheDocument()
  })

  test('hide after create', async () => {
    const crepe = new Crepe()
    await crepe.create()

    crepe.setReadonly(true)

    const view = crepe.editor.ctx.get(editorViewCtx)
    expect(view.dom.querySelector('[data-placeholder]')).not.toBeInTheDocument()
  })
})
