import { defaultValueCtx, Editor, editorViewCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { imageBlockComponent, imageBlockConfig } from '../image-block'
import { imageInlineComponent, inlineImageConfig } from '../image-inline'

type ProxyDomURL = (url: string) => Promise<string> | string

const editors: Editor[] = []

afterEach(async () => {
  for (const editor of editors.splice(0)) await editor.destroy()
})

// Give each src a pending answer that the test resolves by hand.
function deferredProxy() {
  const pending = new Map<string, Array<(url: string) => void>>()
  const proxyDomURL = (url: string) =>
    new Promise<string>((resolve) => {
      pending.set(url, [...(pending.get(url) ?? []), resolve])
    })
  const answer = async (url: string) => {
    for (const resolve of pending.get(url) ?? []) resolve(`/proxied/${url}`)
    pending.delete(url)
    await nextTick()
  }
  return { proxyDomURL, answer }
}

const cases = [
  {
    name: 'image block',
    markdown: '![](old.png)\n',
    pos: 0,
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
  ({ markdown, pos, selector, component, setProxy }) => {
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
      await nextTick()
      await answer('old.png')

      const img = view.dom.querySelector(selector)
      expect(img?.getAttribute('src')).toBe('/proxied/new.png')
    })
  }
)
