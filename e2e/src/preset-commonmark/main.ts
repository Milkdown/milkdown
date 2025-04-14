import { Editor, rootCtx } from '@milkdown/core'
import { clipboard } from '@milkdown/plugin-clipboard'
import { history } from '@milkdown/plugin-history'
import {
  commonmark,
  toggleEmphasisCommand,
  toggleStrongCommand,
} from '@milkdown/preset-commonmark'
import { nord } from '@milkdown/theme-nord'
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

  editor
    .then((instance) => {
      globalThis.commands.toggleStrong = () => {
        instance.action(callCommand(toggleStrongCommand.key))
      }
      globalThis.commands.toggleEmphasis = () => {
        instance.action(callCommand(toggleEmphasisCommand.key))
      }
    })
    .catch(console.error)

  return editor
}).catch(console.error)
