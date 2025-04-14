import { Editor, rootCtx } from '@milkdown/core'
import { history } from '@milkdown/plugin-history'
import { commonmark } from '@milkdown/preset-commonmark'
import { gfm, insertTableCommand } from '@milkdown/preset-gfm'
import { nord } from '@milkdown/theme-nord'
import { callCommand } from '@milkdown/utils'

import { setup } from '../utils'

import '@milkdown/theme-nord/style.css'

import '../style.css'

setup(() => {
  return Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, document.getElementById('app'))
    })
    .config(nord)
    .enableInspector()
    .use(commonmark)
    .use(gfm)
    .use(history)
    .create()
})
  .then((editor1) => {
    globalThis.commands.addTable = () => {
      editor1.action(callCommand(insertTableCommand.key))
    }
  })
  .catch(console.error)

setup(() => {
  return Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, document.getElementById('app'))
    })
    .config(nord)
    .enableInspector()
    .use(commonmark)
    .use(gfm)
    .use(history)
    .create()
})
  .then((editor2) => {
    globalThis.commands.addTable2 = () => {
      editor2.action(callCommand(insertTableCommand.key))
    }
  })
  .catch(console.error)
