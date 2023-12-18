/* Copyright 2021, Milkdown by Mirone. */

import { Editor, defaultValueCtx, rootCtx } from '@milkdown/core'
import { nord } from '@milkdown/theme-nord'
import { commonmark } from '@milkdown/preset-commonmark'
import { history } from '@milkdown/plugin-history'
import { inlineImage } from '@milkdown/components/inline-image'

import { setup } from '../utils'

import '@milkdown/theme-nord/style.css'

import '../style.css'

import './style.css'

const markdown = `
# Inline Image

Inline image: ![milkdown logo](https://github.com/Milkdown/milkdown/actions/workflows/ci.yml/badge.svg) do ![empty image]() you like it?
`

setup(() => {
  return Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, document.getElementById('app'))
      ctx.set(defaultValueCtx, markdown)
    })
    .config(nord)
    .use(history)
    .use(inlineImage)
    .use(commonmark)
    .create()
})
