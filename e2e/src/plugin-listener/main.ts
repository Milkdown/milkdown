import { Editor, defaultValueCtx, rootCtx } from '@milkdown/core'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { commonmark } from '@milkdown/preset-commonmark'
import { nord } from '@milkdown/theme-nord'

import { setup } from '../utils'

import '@milkdown/theme-nord/style.css'

import '../style.css'

setup(() => {
  const search = new URLSearchParams(window.location.search)
  const type = search.get('type')
  return Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, document.getElementById('app'))
      ctx.set(defaultValueCtx, 'test')
      const listener = ctx.get(listenerCtx)
      if (type === 'markdown') {
        listener.markdownUpdated((_, markdown, prevMarkdown) => {
          // oxlint-disable-next-line no-console
          console.log(markdown, prevMarkdown)
        })
      }
      if (type === 'selection') {
        listener.selectionUpdated((_, selection, prevSelection) => {
          const before = `${selection.from}-${selection.to}`
          const after = `${prevSelection?.from ?? 'null'}-${prevSelection?.to ?? 'null'}`
          // oxlint-disable-next-line no-console
          console.log(before, after)
        })
      }
    })
    .config(nord)
    .use(commonmark)
    .use(listener)
    .create()
}).catch(console.error)
