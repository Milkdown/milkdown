import { defaultValueCtx, Editor, editorViewCtx } from '@milkdown/core'
import { commonmark, imageSchema } from '@milkdown/preset-commonmark'
import { afterEach, describe, expect, it } from 'vitest'

import { imageInlineComponent } from '../../image-inline'
import { imageBlockComponent, imageBlockSchema } from '../index'

const editors: Editor[] = []

afterEach(async () => {
  for (const editor of editors.splice(0)) await editor.destroy()
})

describe('image-block NodeView identity', () => {
  it('recreates the NodeView when inserting a new image above an existing image', async () => {
    const editor = Editor.make()
      .config((ctx) => {
        ctx.set(defaultValueCtx, '![first](first.png)\n')
      })
      .use(commonmark)
      .use(imageBlockComponent)
    await editor.create()
    editors.push(editor)

    const view = editor.ctx.get(editorViewCtx)
    const initialWrapper = view.dom.querySelector('.milkdown-image-block')
    const initialImg = initialWrapper?.querySelector('img')
    expect(initialImg?.getAttribute('src')).toBe('first.png')

    const secondNode = imageBlockSchema.type(editor.ctx).create({
      src: 'second.png',
      alt: 'second',
    })
    view.dispatch(view.state.tr.insert(0, secondNode))

    const wrappers = view.dom.querySelectorAll('.milkdown-image-block')
    expect(wrappers).toHaveLength(2)
    expect(wrappers[0]).not.toBe(initialWrapper)
    expect(wrappers[0]?.querySelector('img')).not.toBe(initialImg)
    expect(wrappers[0]?.querySelector('img')?.getAttribute('src')).toBe(
      'second.png'
    )
    expect(wrappers[1]?.querySelector('img')?.getAttribute('src')).toBe(
      'first.png'
    )
  })

  it('reuses the NodeView when only non-src attributes change', async () => {
    const editor = Editor.make()
      .config((ctx) => {
        ctx.set(defaultValueCtx, '![first](first.png)\n')
      })
      .use(commonmark)
      .use(imageBlockComponent)
    await editor.create()
    editors.push(editor)

    const view = editor.ctx.get(editorViewCtx)
    const initialWrapper = view.dom.querySelector('.milkdown-image-block')
    const initialImg = initialWrapper?.querySelector('img')

    view.dispatch(view.state.tr.setNodeAttribute(0, 'caption', 'updated'))

    expect(view.dom.querySelector('.milkdown-image-block')).toBe(initialWrapper)
    expect(view.dom.querySelector('.milkdown-image-block img')).toBe(initialImg)
  })
})

describe('image-inline NodeView identity', () => {
  it('recreates the NodeView when inserting a new inline image before an existing inline image', async () => {
    const editor = Editor.make()
      .config((ctx) => {
        ctx.set(defaultValueCtx, 'Lead ![first](first.png) tail.\n')
      })
      .use(commonmark)
      .use(imageInlineComponent)
    await editor.create()
    editors.push(editor)

    const view = editor.ctx.get(editorViewCtx)
    const initialWrapper = view.dom.querySelector('.milkdown-image-inline')
    const initialImg = initialWrapper?.querySelector('img')
    expect(initialImg?.getAttribute('src')).toBe('first.png')

    const secondNode = imageSchema.type(editor.ctx).create({
      src: 'second.png',
      alt: 'second',
    })
    view.dispatch(view.state.tr.insert(1, secondNode))

    const wrappers = view.dom.querySelectorAll('.milkdown-image-inline')
    expect(wrappers).toHaveLength(2)
    expect(wrappers[0]).not.toBe(initialWrapper)
    expect(wrappers[0]?.querySelector('img')).not.toBe(initialImg)
    expect(wrappers[0]?.querySelector('img')?.getAttribute('src')).toBe(
      'second.png'
    )
    expect(wrappers[1]?.querySelector('img')?.getAttribute('src')).toBe(
      'first.png'
    )
  })
})
