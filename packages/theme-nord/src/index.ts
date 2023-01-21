/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx } from '@milkdown/core'
import { editorViewOptionsCtx } from '@milkdown/core'
import clsx from 'clsx'

import 'prosemirror-tables/style/tables.css'
import 'prosemirror-view/style/prosemirror.css'
import './style.css'

export const nord = (ctx: Ctx): void => {
  ctx.update(editorViewOptionsCtx, (prev) => {
    const prevClass = prev.attributes

    return ({
      ...prev,
      attributes: (state) => {
        const attrs = typeof prevClass === 'function' ? prevClass(state) : prevClass

        return {
          ...attrs,
          class: clsx('prose outline-none dark:prose-invert', attrs?.class || '', 'milkdown milkdown-theme-nord'),
        }
      },
    })
  })
}
