/* Copyright 2021, Milkdown by Mirone. */
import { Editor, rootCtx } from '@milkdown/core'
import { commonmark, toggleEmphasisCommand, toggleStrongCommand } from '@milkdown/preset-commonmark'
import { nord } from '@milkdown/theme-nord'
import { history } from '@milkdown/plugin-history'
import { callCommand } from '@milkdown/utils'

export const setup = () => {
  const editor = Editor.make()
    .enableInspector()
    .config((ctx) => {
      ctx.set(rootCtx, document.getElementById('app'))
    })
    .config(nord)
    .use(commonmark)
    .use(history)
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
}
