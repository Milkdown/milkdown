import { Editor, rootCtx } from '@milkdown/core'
import { automd } from '@milkdown/plugin-automd'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { commonmark, markInputRules } from '@milkdown/preset-commonmark'
import { markInputRules as GFMMarkInputRules, gfm } from '@milkdown/preset-gfm'
import { nord } from '@milkdown/theme-nord'

import { setup } from '../utils'

import '@milkdown/theme-nord/style.css'

import '../style.css'

setup(() => {
  return Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, document.getElementById('app'))
      ctx.get(listenerCtx).markdownUpdated((_, markdown) => {
        // oxlint-disable-next-line no-console
        console.log(markdown)
      })
    })
    .config(nord)
    .use(commonmark.filter((x) => !markInputRules.includes(x)))
    .use(gfm.filter((x) => !GFMMarkInputRules.includes(x)))
    .use(listener)
    .use(automd)
    .create()
}).catch(console.error)
