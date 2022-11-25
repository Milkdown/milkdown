/* Copyright 2021, Milkdown by Mirone. */
import './style.css'

import { Editor, defaultValueCtx, rootCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'

async function main() {
  await Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, '#app')
      ctx.set(defaultValueCtx, '# Here is [mylink](https://milkdown.dev), and $ E = mc^2 $')
    })
    .use(commonmark)
    .create()
}

main()
