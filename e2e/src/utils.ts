import type { Editor } from '@milkdown/core'
import { editorViewCtx, parserCtx, serializerCtx } from '@milkdown/core'
import { Slice } from '@milkdown/prose/model'

export async function setup(createEditor: () => Promise<Editor>) {
  globalThis.commands = {}

  const editor = await createEditor()
  globalThis.__milkdown__ = editor
  globalThis.__view__ = editor.action((ctx) => ctx.get(editorViewCtx))
  globalThis.__setMarkdown__ = (markdown: string) =>
    editor.action((ctx) => {
      const view = ctx.get(editorViewCtx)
      const parser = ctx.get(parserCtx)
      const doc = parser(markdown)
      if (!doc) return
      const state = view.state
      view.dispatch(
        state.tr.replace(
          0,
          state.doc.content.size,
          new Slice(doc.content, 0, 0)
        )
      )
    })
  globalThis.__getMarkdown__ = () =>
    editor.action((ctx) => {
      const view = ctx.get(editorViewCtx)
      const serializer = ctx.get(serializerCtx)
      return serializer(view.state.doc)
    })
  globalThis.__inspect__ = () => editor.inspect()

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
  return editor
}
