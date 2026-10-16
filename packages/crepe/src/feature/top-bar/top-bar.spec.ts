import '@testing-library/jest-dom/vitest'
import { editorViewCtx } from '@milkdown/kit/core'
import { describe, expect, test } from 'vitest'
import { nextTick } from 'vue'

import { Crepe } from '../../core'
import { CrepeFeature } from '../index'

function topBarItems(crepe: Crepe) {
  const view = crepe.editor.ctx.get(editorViewCtx)
  const root = view.dom.parentElement!
  return root.querySelectorAll('.milkdown-top-bar .top-bar-item')
}

function createWithTopBar() {
  return new Crepe({ features: { [CrepeFeature.TopBar]: true } })
}

describe('top bar and readonly mode', () => {
  test('show the items in an editable editor', async () => {
    const crepe = createWithTopBar()
    await crepe.create()
    await nextTick()

    expect(topBarItems(crepe).length).toBeGreaterThan(0)
  })

  // A render in readonly mode returned early and lost its subscription.
  test('show the items after a readonly round trip', async () => {
    const crepe = createWithTopBar()
    await crepe.create()
    crepe.setReadonly(true)
    await nextTick()
    expect(topBarItems(crepe)).toHaveLength(0)

    crepe.setReadonly(false)
    await nextTick()

    expect(topBarItems(crepe).length).toBeGreaterThan(0)
  })
})
