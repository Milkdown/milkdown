import type { EditorView } from '@milkdown/prose/view'

import { defaultValueCtx, Editor, editorViewCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { imageBlockComponent } from '../image-block'
import { imageInlineComponent } from '../image-inline'

const editors: Editor[] = []

afterEach(async () => {
  for (const editor of editors.splice(0)) await editor.destroy()
})

const cases = [
  {
    name: 'image block',
    markdown: '![](a.png)\n',
    emptyMarkdown: '![]()\n',
    pos: 0,
    otherAttr: 'caption',
    host: '.milkdown-image-block',
    selector: '.milkdown-image-block img',
    component: imageBlockComponent,
    insertAbove: (view: EditorView) => {
      const { schema } = view.state
      const tr = view.state.tr.insert(
        0,
        schema.nodes['image-block']!.create({ src: 'b.png' })
      )
      return tr.insert(tr.doc.content.size, schema.nodes.paragraph!.create())
    },
  },
  {
    name: 'inline image',
    markdown: 'Text ![](a.png)\n',
    emptyMarkdown: 'Text ![]()\n',
    // "Text " starts at 1 inside the paragraph, so the image is at 6.
    pos: 6,
    otherAttr: 'alt',
    host: '.milkdown-image-inline',
    selector: '.milkdown-image-inline img',
    component: imageInlineComponent,
    insertAbove: (view: EditorView) => {
      const { schema } = view.state
      const tr = view.state.tr.insert(
        6,
        schema.nodes.image!.create({ src: 'b.png' })
      )
      return tr.insertText(' text.', tr.doc.content.size - 1)
    },
  },
]

describe.each(cases)(
  '$name',
  ({
    markdown,
    emptyMarkdown,
    pos,
    otherAttr,
    host,
    selector,
    component,
    insertAbove,
  }) => {
    async function createEditor(doc = markdown) {
      const editor = Editor.make()
        .config((ctx) => {
          ctx.set(defaultValueCtx, doc)
        })
        .use(commonmark)
        .use(component)
      await editor.create()
      editors.push(editor)
      return editor.ctx.get(editorViewCtx)
    }

    const images = (view: EditorView) =>
      Array.from(view.dom.querySelectorAll<HTMLImageElement>(selector))

    // Regression test for #2394: the new image showed the old picture while
    // its own src loaded. `insertAbove` also adds content after the old
    // image. ProseMirror then cannot match the old image from the end, and
    // offers the view of the old image to the new image.
    it('does not show a new image in the img of an old image', async () => {
      const view = await createEditor()
      const [oldImage] = images(view)

      view.dispatch(insertAbove(view))
      await nextTick()

      expect(images(view).map((img) => img.getAttribute('src'))).toEqual([
        'b.png',
        'a.png',
      ])
      expect(images(view)[0]).not.toBe(oldImage)
      expect(oldImage?.getAttribute('src')).toBe('a.png')
    })

    it('builds a new img when the src changes', async () => {
      const view = await createEditor()
      const [oldImage] = images(view)

      view.dispatch(view.state.tr.setNodeAttribute(pos, 'src', 'b.png'))
      await nextTick()

      const [newImage] = images(view)
      expect(newImage?.getAttribute('src')).toBe('b.png')
      expect(newImage).not.toBe(oldImage)
    })

    it('takes the first src of an empty image in place', async () => {
      const view = await createEditor(emptyMarkdown)
      const oldHost = view.dom.querySelector(host)

      view.dispatch(view.state.tr.setNodeAttribute(pos, 'src', 'b.png'))
      await nextTick()

      expect(view.dom.querySelector(host)).toBe(oldHost)
      expect(images(view)[0]?.getAttribute('src')).toBe('b.png')
    })

    it('keeps the img when another attr changes', async () => {
      const view = await createEditor()
      const [oldImage] = images(view)

      view.dispatch(view.state.tr.setNodeAttribute(pos, otherAttr, 'text'))
      await nextTick()

      expect(images(view)[0]).toBe(oldImage)
    })
  }
)
