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
import { parseImageBlockAlt, serializeImageBlockAlt } from '../alt'
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

  it.each(textAlts.filter(Boolean))(
    'keeps %j and the ratio after resizing and reopening',
    async (alt) => {
      const markdown = `![${alt}](a.png "A caption")\n`
      const saved = await withEditor(
        markdown,
        imageBlockComponent,
        (editor) => {
          resizeImage(editor)
          return editor.action(getMarkdown())
        }
      )
      expect(saved).toBe(`![${alt}|0.75](a.png "A caption")\n`)
      await withEditor(saved, imageBlockComponent, (editor) => {
        expect(editor.action(getMarkdown())).toBe(saved)
        editor.action((ctx) => {
          const view = ctx.get(editorViewCtx)
          const node = view.state.doc.firstChild
          expect(node?.attrs.alt).toBe(alt)
          expect(node?.attrs.ratio).toBe(0.75)
          expect(view.dom.querySelector('img')?.getAttribute('alt')).toBe(alt)
        })
      })
    }
  )

  it('writes a resized image with an empty alt in the ratio-only form', async () => {
    const saved = await withEditor(
      '![](a.png "A caption")\n',
      imageBlockComponent,
      (editor) => {
        resizeImage(editor)
        return editor.action(getMarkdown())
      }
    )
    expect(saved).toBe('![0.75](a.png "A caption")\n')
  })

  it.each([
    ['A red barn|0.75', 'A red barn', 0.75],
    ['A | B|0.50', 'A | B', 0.5],
    ['2024|1.50', '2024', 1.5],
    ['Score|0.50|0.75', 'Score|0.50', 0.75],
  ])('reads %j as alt text and a ratio', async (value, alt, ratio) => {
    for (const title of ['', ' "A caption"']) {
      const markdown = `![${value}](a.png${title})\n`
      await withEditor(markdown, imageBlockComponent, (editor) => {
        expect(editor.action(getMarkdown())).toBe(markdown)
        editor.action((ctx) => {
          const view = ctx.get(editorViewCtx)
          const node = view.state.doc.firstChild
          expect(node?.attrs.alt).toBe(alt)
          expect(node?.attrs.ratio).toBe(ratio)
          expect(view.dom.querySelector('img')?.getAttribute('alt')).toBe(alt)
        })
      })
    }
  })

  it.each([
    'Infinity',
    '-1.00',
    'x|',
    'x|0.5',
    'x|0.00',
    'x|-1.00',
    'x|Infinity',
    'x|0.75 ',
  ])('reads %j as alt text at the default ratio', async (alt) => {
    const markdown = `![${alt}](a.png)\n`
    await withEditor(markdown, imageBlockComponent, (editor) => {
      expect(editor.action(getMarkdown())).toBe(markdown)
      editor.action((ctx) => {
        const node = ctx.get(editorViewCtx).state.doc.firstChild
        expect(node?.attrs.alt).toBe(alt)
        expect(node?.attrs.ratio).toBe(1)
      })
    })
  })

  it('drops the ratio from the alt when an image is resized back to 1', async () => {
    await withEditor(
      '![A red barn|0.75](a.png)\n',
      imageBlockComponent,
      (editor) => {
        editor.action((ctx) => {
          const view = ctx.get(editorViewCtx)
          view.dispatch(view.state.tr.setNodeAttribute(0, 'ratio', 1))
        })
        expect(editor.action(getMarkdown())).toBe('![A red barn](a.png)\n')
      }
    )
  })

  it.each([
    ['0.75', 1, '0.75|1.00'],
    ['Score|0.50', 1, 'Score|0.50|1.00'],
    ['Score|0.50', 0.75, 'Score|0.50|0.75'],
  ])(
    'writes alt text %j at ratio %j so that it reads back as text',
    async (alt, ratio, written) => {
      const saved = await withEditor(
        '![](a.png)\n',
        imageBlockComponent,
        (editor) => {
          editor.action((ctx) => {
            const view = ctx.get(editorViewCtx)
            view.dispatch(
              view.state.tr
                .setNodeAttribute(0, 'alt', alt)
                .setNodeAttribute(0, 'ratio', ratio)
            )
          })
          return editor.action(getMarkdown())
        }
      )
      expect(saved).toBe(`![${written}](a.png)\n`)
      await withEditor(saved, imageBlockComponent, (editor) => {
        editor.action((ctx) => {
          const node = ctx.get(editorViewCtx).state.doc.firstChild
          expect(node?.attrs.alt).toBe(alt)
          expect(node?.attrs.ratio).toBe(ratio)
        })
      })
    }
  )

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

describe('image block alt encoding', () => {
  const alts = [
    null,
    'A red barn',
    '2024',
    '1.5',
    '0.75',
    '1.00',
    'A | B',
    'x|0.50',
    'x|1.00',
    'x|',
    '|',
  ]
  const ratios = [1, 0.75, 0.5, 2, 1.5]

  it.each(alts)('reads back %j at every ratio', (alt) => {
    for (const ratio of ratios) {
      const written = serializeImageBlockAlt({ alt, ratio })
      expect(parseImageBlockAlt(written)).toEqual({ alt, ratio })
    }
  })

  it('reads back an empty alt as no alt once resized', () => {
    expect(serializeImageBlockAlt({ alt: '', ratio: 1 })).toBe('')
    expect(parseImageBlockAlt('')).toEqual({ alt: '', ratio: 1 })
    expect(serializeImageBlockAlt({ alt: '', ratio: 0.75 })).toBe('0.75')
    expect(parseImageBlockAlt('0.75')).toEqual({ alt: null, ratio: 0.75 })
  })

  it('writes alt text alone when the ratio cannot be read back', () => {
    for (const ratio of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, 0.001])
      expect(serializeImageBlockAlt({ alt: 'A red barn', ratio })).toBe(
        'A red barn'
      )
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
