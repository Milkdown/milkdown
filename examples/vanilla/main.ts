/* Copyright 2021, Milkdown by Mirone. */
import './style.css'

import { Editor, defaultValueCtx, rootCtx } from '@milkdown/core'
import { codeBlockFrameConfig, commonmark, components } from '@milkdown/preset-commonmark'
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
    .use(components)
    .config((ctx) => {
      ctx.get(codeBlockFrameConfig.slice).onBuild((Root, Content, props) => {
        const select = document.createElement('select');
        ['js', 'css', 'html', 'ts'].forEach((language) => {
          const option = document.createElement('option')
          option.value = language
          option.innerText = language
          if (language === props.node.attrs.language)
            option.selected = true

          select.appendChild(option)
        })
        select.onchange = (e) => {
          const { value } = e.target as HTMLSelectElement
          props.setLanguage(value)
        }

        const copy = document.createElement('button')
        copy.textContent = 'copy'
        copy.onclick = () => {
          // eslint-disable-next-line no-console
          console.log(props.getContent())
        }

        Root.appendChild(select)
        Root.appendChild(copy)
        Root.appendChild(Content)
      })
    })
    .create()
}

main()
