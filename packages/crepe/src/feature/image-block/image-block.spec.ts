import { imageBlockConfig } from '@milkdown/kit/component/image-block'
import { editorViewCtx, schemaCtx } from '@milkdown/kit/core'
import { defaultUploader, uploadConfig } from '@milkdown/kit/plugin/upload'
import { describe, expect, it } from 'vitest'

import { Crepe } from '../../core'

describe('image block Markdown', () => {
  it.each(['A red barn', '', '2024', '1.5', '1.00'])(
    'preserves %j on create and getMarkdown without edits',
    async (alt) => {
      const markdown = `Text.\n\n![${alt}](a.webp)\n\nMore.\n`
      const crepe = new Crepe({ defaultValue: markdown })
      await crepe.create()
      try {
        expect(crepe.getMarkdown()).toBe(markdown)
        crepe.editor.action((ctx) => {
          expect(
            ctx.get(editorViewCtx).dom.querySelector('img')?.getAttribute('alt')
          ).toBe(alt === '1.00' ? '' : alt)
        })
      } finally {
        await crepe.destroy()
      }
    }
  )

  it('keeps the ratio encoding for an uploaded block', async () => {
    const crepe = new Crepe()
    crepe.editor.config((ctx) => {
      ctx.update(imageBlockConfig.key, (config) => ({
        ...config,
        onUpload: async () => 'a.png',
      }))
    })
    await crepe.create()
    try {
      await crepe.editor.action(async (ctx) => {
        const file = new File(['image'], 'A red barn.png', {
          type: 'image/png',
        })
        const files = { length: 1, item: () => file } as unknown as FileList
        const nodes = await ctx
          .get(uploadConfig.key)
          .uploader(files, ctx.get(schemaCtx), ctx, 0)
        const view = ctx.get(editorViewCtx)
        view.dispatch(
          view.state.tr.replaceWith(0, view.state.doc.content.size, nodes)
        )
      })
      expect(crepe.getMarkdown().trim()).toBe('![1.00](a.png)')
    } finally {
      await crepe.destroy()
    }
  })

  it('preserves the filename alt written by the default uploader', async () => {
    const crepe = new Crepe()
    await crepe.create()
    try {
      await crepe.editor.action(async (ctx) => {
        const file = new File(['image'], 'A red barn.png', {
          type: 'image/png',
        })
        const files = { length: 1, item: () => file } as unknown as FileList
        const nodes = await defaultUploader(files, ctx.get(schemaCtx), ctx, 1)
        const view = ctx.get(editorViewCtx)
        view.dispatch(view.state.tr.replaceWith(1, 1, nodes))
      })
      expect(crepe.getMarkdown().trim()).toBe(
        '![A red barn.png](data:image/png;base64,aW1hZ2U=)'
      )
    } finally {
      await crepe.destroy()
    }
  })
})
