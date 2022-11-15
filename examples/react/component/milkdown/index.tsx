/* Copyright 2021, Milkdown by Mirone. */

import { Editor, defaultValueCtx, rootCtx } from '@milkdown/core'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { prism } from '@milkdown/plugin-prism'
import { tooltip } from '@milkdown/plugin-tooltip'
import { codeFence as cmCodeFence, commonmark, image, link } from '@milkdown/preset-commonmark'
import type { Node } from '@milkdown/prose/model'
import { ReactEditor, useEditor, useNodeCtx } from '@milkdown/react'
import { nord } from '@milkdown/theme-nord'
import type { FC, ReactNode } from 'react'
import { useEffect } from 'react'

import { CodeFence } from './CodeFence'
import { codeFence } from './CodeFence/codeFence.node'
import { Image } from './Image'

const Link: FC<{ children: ReactNode }> = ({ children }) => {
  const { node } = useNodeCtx()
  return (
        <a className="my-title" href={node.attrs.href} title={node.attrs.tittle}>
            {children}
        </a>
  )
}

export const Milkdown: FC<{ value: string }> = ({ value }) => {
  const { editor, loading, getInstance } = useEditor((root, renderReact) => {
    const nodes = commonmark
      .configure(image, { view: renderReact(Image) })
      .configure(link, { view: renderReact(Link) })
      .replace(cmCodeFence, codeFence(renderReact<Node>(CodeFence, { as: 'section' }))())
    return Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root)
        ctx.set(defaultValueCtx, value)
        ctx.get(listenerCtx).markdownUpdated((_, value) => {
          // eslint-disable-next-line no-console
          console.log(value)
        })
      })
      .use(nord)
      .use(nodes)
      .use(tooltip)
      .use(prism)
      .use(listener)
  })

  useEffect(() => {
    if (!loading) {
      const instance = getInstance()
      instance?.action((ctx) => {
        // eslint-disable-next-line no-console
        console.log(ctx)
        // do something
      })
    }
  }, [getInstance, loading])

  return <ReactEditor editor={editor} />
}
