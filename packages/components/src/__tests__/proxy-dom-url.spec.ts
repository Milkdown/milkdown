import { defaultValueCtx, Editor, editorViewCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import type { ImageBlockConfig } from '../image-block'

import { imageBlockComponent, imageBlockConfig } from '../image-block'
import { imageInlineComponent, inlineImageConfig } from '../image-inline'

type ProxyDomURL = NonNullable<ImageBlockConfig['proxyDomURL']>

const editors: Editor[] = []

afterEach(async () => {
  for (const editor of editors.splice(0)) await editor.destroy()
  vi.restoreAllMocks()
})

// Let pending Promise callbacks and the Vue render run.
const flush = async () => {
  await new Promise((resolve) => setTimeout(resolve))
  await nextTick()
}

// Queue a pending request for each call. The test settles the oldest
// pending request of a src by hand.
function deferredProxy() {
  const pending = new Map<
    string,
    Array<{ resolve: (url: string) => void; reject: (error: Error) => void }>
  >()
  const proxyDomURL = vi.fn(
    (url: string) =>
      new Promise<string>((resolve, reject) => {
        pending.set(url, [...(pending.get(url) ?? []), { resolve, reject }])
      })
  )
  const next = (url: string) => pending.get(url)?.shift()
  const answer = async (url: string) => {
    next(url)?.resolve(`/proxied/${url}`)
    await flush()
  }
  const fail = async (url: string) => {
    next(url)?.reject(new Error(`cannot proxy ${url}`))
    await flush()
  }
  return { proxyDomURL, answer, fail }
}

const cases = [
  {
    name: 'image block',
    markdown: '![](old.png)\n',
    pos: 0,
    otherAttr: 'caption',
    selector: '.milkdown-image-block img',
    component: imageBlockComponent,
    setProxy: (editor: Editor, proxyDomURL: ProxyDomURL) =>
      editor.config((ctx) => {
        ctx.update(imageBlockConfig.key, (c) => ({ ...c, proxyDomURL }))
      }),
  },
  {
    name: 'inline image',
    markdown: 'Text ![](old.png) text.\n',
    // "Text " starts at 1 inside the paragraph, so the image is at 6.
    pos: 6,
    otherAttr: 'alt',
    selector: '.milkdown-image-inline img',
    component: imageInlineComponent,
    setProxy: (editor: Editor, proxyDomURL: ProxyDomURL) =>
      editor.config((ctx) => {
        ctx.update(inlineImageConfig.key, (c) => ({ ...c, proxyDomURL }))
      }),
  },
]

describe.each(cases)(
  '$name',
  ({ markdown, pos, otherAttr, selector, component, setProxy }) => {
    async function createEditor(proxyDomURL: ProxyDomURL) {
      const editor = Editor.make()
        .config((ctx) => {
          ctx.set(defaultValueCtx, markdown)
        })
        .use(commonmark)
        .use(component)
      setProxy(editor, proxyDomURL)
      await editor.create()
      editors.push(editor)
      return editor.ctx.get(editorViewCtx)
    }

    it('ignores a late answer for an old src', async () => {
      const { proxyDomURL, answer } = deferredProxy()
      const view = await createEditor(proxyDomURL)

      view.dispatch(view.state.tr.setNodeAttribute(pos, 'src', 'new.png'))
      await answer('new.png')
      await answer('old.png')

      const img = view.dom.querySelector(selector)
      expect(img?.getAttribute('src')).toBe('/proxied/new.png')
    })

    it('ignores a late answer after a string answer', async () => {
      const { proxyDomURL, answer } = deferredProxy()
      const view = await createEditor((url) =>
        url === 'new.png' ? `/proxied/${url}` : proxyDomURL(url)
      )

      view.dispatch(view.state.tr.setNodeAttribute(pos, 'src', 'new.png'))
      await flush()
      await answer('old.png')

      const img = view.dom.querySelector(selector)
      expect(img?.getAttribute('src')).toBe('/proxied/new.png')
    })

    it('keeps a pending answer when another attr changes', async () => {
      const { proxyDomURL, answer } = deferredProxy()
      const view = await createEditor(proxyDomURL)

      view.dispatch(view.state.tr.setNodeAttribute(pos, otherAttr, 'text'))
      await answer('old.png')

      const img = view.dom.querySelector(selector)
      expect(img?.getAttribute('src')).toBe('/proxied/old.png')
      expect(proxyDomURL).toHaveBeenCalledTimes(1)
    })

    it('shows the node src when the newest request fails', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { proxyDomURL, answer, fail } = deferredProxy()
      const view = await createEditor(proxyDomURL)

      await answer('old.png')
      view.dispatch(view.state.tr.setNodeAttribute(pos, 'src', 'new.png'))
      await fail('new.png')

      const img = view.dom.querySelector(selector)
      expect(img?.getAttribute('src')).toBe('new.png')
      expect(error).toHaveBeenCalledOnce()
    })
  }
)
