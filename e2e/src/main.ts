/* Copyright 2021, Milkdown by Mirone. */
import type { Editor } from '@milkdown/core'
import { editorViewCtx, parserCtx, serializerCtx } from '@milkdown/core'
import { Slice } from '@milkdown/prose/model'
import '@milkdown/theme-nord/style.css'

import './style.css'

const mapping = {
  'preset-commonmark': () => import('./preset-commonmark'),
  'preset-gfm': () => import('./preset-gfm'),
  'plugin-listener': () => import('./plugin-listener'),
  'plugin-clipboard': () => import('./plugin-clipboard'),
}

let editor: Editor | undefined

const main = async () => {
  const url = new URL(location.href)
  if (!url.hash)
    return

  const key = url.hash.slice(2) as keyof typeof mapping
  const name = mapping[key]
  if (!name)
    throw new Error(`Cannot get target test container: ${key}`)

  if (editor)
    await editor.destroy()

  const module = await name()
  editor = await module.setup()
  globalThis.__milkdown__ = editor
  globalThis.__setMarkdown__ = (markdown: string) =>
    editor!.action((ctx) => {
      const view = ctx.get(editorViewCtx)
      const parser = ctx.get(parserCtx)
      const doc = parser(markdown)
      if (!doc)
        return
      const state = view.state
      view.dispatch(state.tr.replace(0, state.doc.content.size, new Slice(doc.content, 0, 0)))
    })
  globalThis.__getMarkdown__ = () =>
    editor!.action((ctx) => {
      const view = ctx.get(editorViewCtx)
      const serializer = ctx.get(serializerCtx)
      return serializer(view.state.doc)
    })
  globalThis.__inspect__ = () => editor!.inspect()

  if (import.meta.env.PROD) {
    const ui = document.querySelector<HTMLElement>('#ui')!
    ui.remove()
  }
  else {
    const logButton = document.querySelector<HTMLDivElement>('#log')

    if (logButton) {
      // eslint-disable-next-line no-console
      logButton.onclick = () => console.log(globalThis.__getMarkdown__())
    }

    const inspectButton = document.querySelector<HTMLDivElement>('#inspect')
    if (inspectButton) {
      // eslint-disable-next-line no-console
      inspectButton.onclick = () => console.log(globalThis.__inspect__())
    }
  }
}

main()

window.onhashchange = () => {
  main()
}
