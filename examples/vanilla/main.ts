/* Copyright 2021, Milkdown by Mirone. */
import './style.css'

import { Editor, defaultValueCtx, rootCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { gfm } from '@milkdown/preset-gfm'

const markdown = `
# Here is [my link](https://milkdown.dev). Which is an awesome editor[^1].

[^1]: Do you know editor?

- [x] Milkdown
- [ ] Tiptap
- [x] Prosemirror
- Remirror

\`\`\`ts
const a = 1
\`\`\`
`

async function main() {
  await Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, '#app')
      ctx.set(defaultValueCtx, markdown.trim())
    })
    .use(commonmark)
    .use(gfm)
    .create()
}

main()
