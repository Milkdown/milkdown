import { Editor, defaultValueCtx, rootCtx } from '@milkdown/core'
import { nord } from '@milkdown/theme-nord'
import { commonmark } from '@milkdown/preset-commonmark'
import { imageBlockComponent } from '@milkdown/components/image-block'

import { setup } from '../utils'

import '@milkdown/theme-nord/style.css'

import '../style.css'

import './style.css'

const markdown = `
# Image Block

![0.5](/milkdown-logo.png)

![]()

`

setup(() => {
  return Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, document.getElementById('app'))
      ctx.set(defaultValueCtx, markdown)
    })
    .config(nord)
    .use(commonmark)
    .use(imageBlockComponent)
    .create()
})
