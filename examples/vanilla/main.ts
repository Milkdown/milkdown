/* Copyright 2021, Milkdown by Mirone. */
import './style.css'

import { commands, inputrules, keymap, plugins, schema } from '@milkdown/preset-commonmark'
import { Editor, defaultValueCtx, rootCtx } from '@milkdown/core'

async function main() {
  await Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, '#app')
      ctx.set(defaultValueCtx, '# Here is [mylink](https://milkdown.dev), and $ E = mc^2 $')
    })
    .use(schema)
    .use(inputrules)
    .use(commands)
    .use(keymap)
    .use(plugins)
    .create()
}

main()
