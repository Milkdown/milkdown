/* Copyright 2021, Milkdown by Mirone. */
import { Plugin } from '@milkdown/prose/state'
import { DecorationSet } from '@milkdown/prose/view'
import { $prose } from '@milkdown/utils'
import type { useWidgetViewFactory } from '@prosemirror-adapter/react'
import { useWidgetViewContext } from '@prosemirror-adapter/react'
import clsx from 'clsx'
import type { FC } from 'react'
import { useLinkClass } from '../hooks/useLinkClass'

export const LinkWidget: FC = () => {
  const { spec } = useWidgetViewContext()
  const href = spec?.href ?? ''
  const linkClass = useLinkClass()
  const isInnerLink = href.startsWith('#') || href.startsWith('/')

  return (
    <span className="not-prose">
      <a href={href} target={isInnerLink ? '_self' : '_blank'} className={clsx('inline-flex items-center justify-center gap-1 rounded px-2', linkClass(false))} rel="noreferrer">
        <span className="material-symbols-outlined text-nord8 text-sm ">open_in_new</span>
        <small className="text-nord8 font-light">
          {href}
        </small>
      </a>
    </span>
  )
}

export const linkPlugin = (widgetViewFactory: ReturnType<typeof useWidgetViewFactory>) => {
  const widget = widgetViewFactory({ as: 'span', component: LinkWidget })

  return $prose(() => new Plugin({
    state: {
      init() {
        return DecorationSet.empty
      },
      apply(tr) {
        const { selection } = tr

        const { $from, $to } = selection
        const node = tr.doc.nodeAt(selection.from)

        const mark = node?.marks.find(mark => mark.type.name === 'link')

        if (!mark)
          return DecorationSet.empty

        let markPos = { start: -1, end: -1 }
        tr.doc.nodesBetween($from.start(), $to.end(), (n, pos) => {
          if (node === n) {
            markPos = {
              start: pos,
              end: pos + Math.max(n.textContent.length, 1),
            }

            // stop recursing if result is found
            return false
          }
          return undefined
        })

        return DecorationSet.create(tr.doc, [
          widget(markPos.end, {
            href: mark.attrs.href,
            title: mark.attrs.title,
          }),
        ])
      },
    },
    props: {
      decorations(state) {
        return this.getState(state)
      },
    },
  }))
}
