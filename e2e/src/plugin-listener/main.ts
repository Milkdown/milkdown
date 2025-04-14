import { Editor, defaultValueCtx, rootCtx } from '@milkdown/core'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { commonmark } from '@milkdown/preset-commonmark'
import { nord } from '@milkdown/theme-nord'

import { setup } from '../utils'

import '@milkdown/theme-nord/style.css'

import '../style.css'

setup(() => {
  return Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, document.getElementById('app'))
      ctx.set(defaultValueCtx, 'test')
      ctx.get(listenerCtx).markdownUpdated((_, markdown, prevMarkdown) => {
        // oxlint-disable-next-line no-console
        console.log(markdown, prevMarkdown)
      })
    })
    .config(nord)
    .use(commonmark)
    .use(listener)
    .create()
}).catch(console.error)
