import { Editor, rootCtx } from '@milkdown/core'
import { nord } from '@milkdown/theme-nord'
import {
  commonmark,
  toggleEmphasisCommand,
  toggleStrongCommand,
} from '@milkdown/preset-commonmark'
import { clipboard } from '@milkdown/plugin-clipboard'
import { history } from '@milkdown/plugin-history'
import { callCommand } from '@milkdown/utils'

import { setup } from '../utils'

import '@milkdown/theme-nord/style.css'

import '../style.css'

setup(() => {
  const editor = Editor.make()
    .enableInspector()
    .config((ctx) => {
      ctx.set(rootCtx, document.getElementById('app'))
    })
    .config(nord)
    .use(commonmark)
    .use(history)
    .use(clipboard)
    .create()

  editor.then((instance) => {
    globalThis.commands.toggleStrong = () => {
      instance.action(callCommand(toggleStrongCommand.key))
    }
    globalThis.commands.toggleEmphasis = () => {
      instance.action(callCommand(toggleEmphasisCommand.key))
    }
  })
  return editor
})
