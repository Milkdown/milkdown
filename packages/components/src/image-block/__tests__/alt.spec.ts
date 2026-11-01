import type { MilkdownPlugin } from '@milkdown/ctx'

import { defaultValueCtx, Editor, editorViewCtx } from '@milkdown/core'
import {
  commonmark,
  insertImageCommand,
  updateImageCommand,
} from '@milkdown/preset-commonmark'
import { DOMParser, DOMSerializer } from '@milkdown/prose/model'
import { NodeSelection } from '@milkdown/prose/state'
import { callCommand, getMarkdown } from '@milkdown/utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { imageInlineComponent } from '../../image-inline'
import { imageBlockComponent } from '../index'
import { remarkImageBlockPlugin } from '../remark-plugin'
import { imageBlockSchema } from '../schema'

async function withEditor<T>(
  markdown: string,
  plugins: MilkdownPlugin[],
  fn: (editor: Editor) => T | Promise<T>
): Promise<T> {
  const editor = Editor.make()
    .config((ctx) => ctx.set(defaultValueCtx, markdown))
    .use(commonmark)
    .use(plugins)

  await editor.create()
  try {
    return await fn(editor)
  } finally {
    await editor.destroy()
  }
}

const textAlts = ['A red barn', '', '2024', '1.5', '0.00']

function resizeImage(editor: Editor) {
  editor.action((ctx) => {
    const view = ctx.get(editorViewCtx)
    const image = view.dom.querySelector('img')
    const host = view.dom.querySelector<HTMLElement>('.milkdown-image-block')
    const handle = view.dom.querySelector('.image-resize-handle')
    if (!image || !host || !handle) throw new Error('Image block is missing')

    Object.defineProperties(image, {
      naturalWidth: { value: 200 },
      naturalHeight: { value: 200 },
    })
    host.getBoundingClientRect = () => new DOMRect(0, 0, 400, 400)
    image.dispatchEvent(new Event('load'))
    handle.dispatchEvent(new MouseEvent('pointerdown'))
    window.dispatchEvent(new MouseEvent('pointermove', { clientY: 150 }))
    window.dispatchEvent(new Event('pointerup'))

    expect(view.state.doc.firstChild?.attrs.ratio).toBe(0.75)
  })
}

describe('image block alt text', () => {
  it.each(textAlts)(
    'preserves %j when opened and saved without edits',
    async (alt) => {
      for (const title of ['', ' "A caption"']) {
        const markdown = `![${alt}](a.png${title})\n`
        await withEditor(markdown, imageBlockComponent, (editor) => {
          expect(editor.action(getMarkdown())).toBe(markdown)
          editor.action((ctx) => {
            const view = ctx.get(editorViewCtx)
            const node = view.state.doc.firstChild
            expect(node?.type.name).toBe('image-block')
            expect(node?.attrs.alt).toBe(alt)
            expect(node?.attrs.ratio).toBe(1)
            expect(() => view.state.doc.check()).not.toThrow()
            expect(view.dom.querySelector('img')?.getAttribute('alt')).toBe(alt)
          })
        })
      }
    }
  )

  it('preserves alt text without a node view', async () => {
    await withEditor(
      '![A red barn](a.png)\n',
      [remarkImageBlockPlugin, imageBlockSchema].flat(),
      (editor) => {
        expect(editor.action(getMarkdown())).toBe('![A red barn](a.png)\n')
        editor.action((ctx) => {
          expect(
            ctx.get(editorViewCtx).dom.querySelector('img')?.getAttribute('alt')
          ).toBe('A red barn')
        })
      }
    )
  })

  it.each(textAlts)('keeps %j after resizing and reopening', async (alt) => {
    const markdown = `![${alt}](a.png "A caption")\n`
    const saved = await withEditor(markdown, imageBlockComponent, (editor) => {
      resizeImage(editor)
      return editor.action(getMarkdown())
    })
    expect(saved).toBe(markdown)
    await withEditor(saved, imageBlockComponent, (editor) => {
      editor.action((ctx) => {
        const node = ctx.get(editorViewCtx).state.doc.firstChild
        expect(node?.attrs.alt).toBe(alt)
        expect(node?.attrs.ratio).toBe(1)
      })
    })
  })

  it.each(['1.00', '0.50', '1.50', '2024.00'])(
    'keeps the legacy ratio %j and caption behavior',
    async (alt) => {
      for (const caption of ['', 'A caption']) {
        const title = caption ? ` "${caption}"` : ''
        const markdown = `![${alt}](a.png${title})\n`
        await withEditor(markdown, imageBlockComponent, (editor) => {
          expect(editor.action(getMarkdown())).toBe(markdown)
          editor.action((ctx) => {
            const view = ctx.get(editorViewCtx)
            expect(view.state.doc.firstChild?.attrs.alt).toBeNull()
            expect(view.state.doc.firstChild?.attrs.ratio).toBe(Number(alt))
            expect(view.dom.querySelector('img')?.getAttribute('alt')).toBe(
              caption
            )
          })
          resizeImage(editor)
          expect(editor.action(getMarkdown())).toBe(`![0.75](a.png${title})\n`)
        })
      }
    }
  )

  it.each([...textAlts, '1.00'])(
    'preserves %j through schema DOM serialization and parsing',
    async (alt) => {
      const markdown = `![${alt}](a.png "A caption")\n`
      await withEditor(markdown, imageBlockComponent, (editor) => {
        editor.action((ctx) => {
          const view = ctx.get(editorViewCtx)
          const { doc, schema } = view.state
          const dom = document.createElement('div')
          dom.append(
            DOMSerializer.fromSchema(schema).serializeFragment(doc.content)
          )
          const parsed = DOMParser.fromSchema(schema).parse(dom)
          expect(parsed.eq(doc)).toBe(true)
        })
      })
    }
  )

  it('updates the rendered alt when the node attribute changes', async () => {
    await withEditor(
      '![A red barn](a.png)\n',
      imageBlockComponent,
      async (editor) => {
        editor.action((ctx) => {
          const view = ctx.get(editorViewCtx)
          view.dispatch(view.state.tr.setNodeAttribute(0, 'alt', 'A blue barn'))
        })
        await nextTick()
        editor.action((ctx) => {
          expect(
            ctx.get(editorViewCtx).dom.querySelector('img')?.getAttribute('alt')
          ).toBe('A blue barn')
        })
        expect(editor.action(getMarkdown())).toBe('![A blue barn](a.png)\n')
      }
    )
  })

  it('keeps the legacy ratio encoding for a new block', async () => {
    await withEditor('', imageBlockComponent, (editor) => {
      editor.action((ctx) => {
        const view = ctx.get(editorViewCtx)
        const node = imageBlockSchema.type(ctx).create({
          src: 'a.png',
          caption: 'A caption',
          ratio: 0.75,
        })
        view.dispatch(
          view.state.tr.replaceWith(0, view.state.doc.content.size, node)
        )
      })
      expect(editor.action(getMarkdown())).toBe('![0.75](a.png "A caption")\n')
    })
  })
})

describe('other image paths', () => {
  it.each([...textAlts, '1.00'])(
    'preserves %j in commonmark and the inline component',
    async (alt) => {
      const markdown = `![${alt}](a.png "A caption")\n`
      for (const plugins of [[], imageInlineComponent]) {
        await withEditor(markdown, plugins, (editor) => {
          expect(editor.action(getMarkdown())).toBe(markdown)
          editor.action((ctx) => {
            const view = ctx.get(editorViewCtx)
            expect(view.state.doc.firstChild?.firstChild?.type.name).toBe(
              'image'
            )
            expect(view.dom.querySelector('img')?.getAttribute('alt')).toBe(alt)
          })
        })
      }
    }
  )

  it('preserves an image that shares a paragraph with a caption line', async () => {
    const markdown = '![A lantern](x.webp)\\\nA caption\n'
    await withEditor(
      markdown,
      [...imageBlockComponent, ...imageInlineComponent],
      (editor) => {
        expect(editor.action(getMarkdown())).toBe(markdown)
        editor.action((ctx) => {
          const view = ctx.get(editorViewCtx)
          expect(view.state.doc.firstChild?.type.name).toBe('paragraph')
          expect(view.dom.querySelector('img')?.getAttribute('alt')).toBe(
            'A lantern'
          )
        })
      }
    )
  })

  it('preserves alt text inserted and updated through image commands', async () => {
    await withEditor('', imageInlineComponent, (editor) => {
      editor.action((ctx) => {
        const view = ctx.get(editorViewCtx)
        callCommand(insertImageCommand.key, {
          src: 'a.png',
          alt: 'A red barn',
        })(ctx)
        expect(editor.action(getMarkdown())).toBe('![A red barn](a.png)\n')
        view.dispatch(
          view.state.tr.setSelection(NodeSelection.create(view.state.doc, 1))
        )
        callCommand(updateImageCommand.key, { alt: '2024' })(ctx)
      })
      expect(editor.action(getMarkdown())).toBe('![2024](a.png)\n')
    })
  })
})
