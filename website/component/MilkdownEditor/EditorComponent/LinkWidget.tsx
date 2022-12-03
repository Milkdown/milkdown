/* Copyright 2021, Milkdown by Mirone. */
import { commandsCtx } from '@milkdown/core'
import { updateLinkCommand } from '@milkdown/preset-commonmark'
import { Plugin } from '@milkdown/prose/state'
import { DecorationSet } from '@milkdown/prose/view'
import { useInstance } from '@milkdown/react'
import { $prose } from '@milkdown/utils'
import type { useWidgetViewFactory } from '@prosemirror-adapter/react'
import { useWidgetViewContext } from '@prosemirror-adapter/react'
import type { FC } from 'react'

export const LinkWidgetBefore: FC = () => {
  return <>[</>
}

export const LinkWidgetAfter: FC = () => {
  const { spec } = useWidgetViewContext()
  const [loading, editor] = useInstance()
  const href = spec?.href ?? ''
  const title = spec?.title ?? ''

  return (
    <>
      ]
      <span>
      ({
        <>
          <small className="text-blue-400 font-light">link: </small>
          <input
            placeholder="link"
            onBlur={(e) => {
              if (loading)
                return
              editor().action((ctx) => {
                const commands = ctx.get(commandsCtx)
                commands.call(updateLinkCommand.key, { href: e.target.value })
              })
            }}
           className="form-input p-0 border-none"
           type="text"
           defaultValue={href}
          />
          &nbsp;
          <small className="text-blue-400 font-light">title: </small>
          &quot;
          <input
            placeholder="title"
            onBlur={(e) => {
              if (loading)
                return
              editor().action((ctx) => {
                const commands = ctx.get(commandsCtx)
                commands.call(updateLinkCommand.key, { title: e.target.value })
              })
            }}
            className="form-input p-0 border-none !w-8"
            type="text"
            defaultValue={title}
          />
          &quot;
        </>
      })
      </span>
    </>
  )
}

export const linkPlugin = (
  widgetViewFactory: ReturnType<typeof useWidgetViewFactory>,
) => {
  const before = widgetViewFactory({ as: 'span', component: LinkWidgetBefore })
  const after = widgetViewFactory({ as: 'span', component: LinkWidgetAfter })

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
          // stop recursing if result is found
          if (markPos.start > -1)
            return false

          if (node === n) {
            markPos = {
              start: pos,
              end: pos + Math.max(n.textContent.length, 1),
            }
          }
          return undefined
        })

        return DecorationSet.create(tr.doc, [
          before(markPos.start),
          after(markPos.end, {
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
