/* Copyright 2021, Milkdown by Mirone. */
import { headingSchema } from '@milkdown/preset-commonmark'
import { Plugin } from '@milkdown/prose/state'
import type { Decoration } from '@milkdown/prose/view'
import { DecorationSet } from '@milkdown/prose/view'
import { $prose } from '@milkdown/utils'
import type { useWidgetViewFactory } from '@prosemirror-adapter/react'
import { useWidgetViewContext } from '@prosemirror-adapter/react'
import type { FC } from 'react'

const HeadingWidget: FC = () => {
  const { spec } = useWidgetViewContext()
  const id: string = spec?.id ?? ''

  return (
    <a className="text-nord10 hover:text-nord7 mr-1 align-middle text-[1em]" href={`#${id}`}>
      <span className="material-symbols-outlined text-[1em]">tag</span>
    </a>
  )
}

export const headingAnchorPlugin = (widgetViewFactory: ReturnType<typeof useWidgetViewFactory>) => {
  const widget = widgetViewFactory({ as: 'span', component: HeadingWidget })

  return $prose(() => new Plugin({
    state: {
      init() {
        return DecorationSet.empty
      },
      apply(tr) {
        const widgets: Decoration[] = []

        tr.doc.descendants((node, pos) => {
          if (node.type === headingSchema.type()) {
            widgets.push(widget(pos + 1, {
              id: node.attrs.id,
              side: -1,
            }))
          }
        })

        return DecorationSet.create(tr.doc, widgets)
      },
    },
    props: {
      decorations(state) {
        return this.getState(state)
      },
    },
  }))
}
