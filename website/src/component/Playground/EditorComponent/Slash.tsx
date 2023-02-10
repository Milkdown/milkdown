/* Copyright 2021, Milkdown by Mirone. */

import { commandsCtx, editorViewCtx } from '@milkdown/core'
import { SlashProvider } from '@milkdown/plugin-slash'
import { createCodeBlockCommand, insertHrCommand, wrapInHeadingCommand } from '@milkdown/preset-commonmark'
import { useInstance } from '@milkdown/react'
import { usePluginViewContext } from '@prosemirror-adapter/react'
import { useEffect, useRef } from 'react'

export const Slash = () => {
  const { view, prevState } = usePluginViewContext()
  const slashProvider = useRef<SlashProvider>()
  const ref = useRef<HTMLDivElement>(null)
  const [loading, getEditor] = useInstance()

  useEffect(() => {
    if (!ref.current || loading)
      return

    let show = false
    slashProvider.current ??= new SlashProvider({
      content: ref.current,
      tippyOptions: {
        onShow: () => {
          show = true
        },
        onHide: () => {
          show = false
        },
      },
    })

    const root = getEditor().ctx.isInjected(editorViewCtx) && getEditor().ctx.get(editorViewCtx).dom
    if (!root)
      return

    const onKeydown = (e: KeyboardEvent) => {
      const key = e.key
      if (show && (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter')) {
        e.stopPropagation()
        e.preventDefault()
        // TODO: handle keyboard event here
      }
    }

    root.addEventListener('keydown', onKeydown)

    return () => {
      root.removeEventListener('keydown', onKeydown)
      slashProvider.current?.destroy()
    }
  }, [loading, getEditor])

  useEffect(() => {
    slashProvider.current?.update(view, prevState)
  })

  return (
    <div>
      <div role="tooltip" className="w-96 rounded bg-gray-50 shadow-lg ring-2 dark:bg-gray-900" ref={ref}>
        <ul className="m-0 list-none">
          <li
          onClick={() => {
            if (loading)
              return

            getEditor().action((ctx) => {
              // remove slash
              const view = ctx.get(editorViewCtx)
              view.dispatch(view.state.tr.delete(view.state.selection.from - 1, view.state.selection.from))

              ctx.get(commandsCtx).call(wrapInHeadingCommand.key, 1)
            })
          }}
          className="cursor-pointer px-6 py-3 hover:bg-gray-200 hover:dark:bg-gray-700"
        >
            Heading 1
          </li>
          <li
          onClick={() => {
            if (loading)
              return

            getEditor().action((ctx) => {
              // remove slash
              const view = ctx.get(editorViewCtx)
              view.dispatch(view.state.tr.delete(view.state.selection.from - 1, view.state.selection.from))

              ctx.get(commandsCtx).call(wrapInHeadingCommand.key, 2)
            })
          }}
          className="cursor-pointer px-6 py-3 hover:bg-gray-200 hover:dark:bg-gray-700"
        >
            Heading 2
          </li>
          <li
          onClick={() => {
            if (loading)
              return

            getEditor().action((ctx) => {
              // remove slash
              const view = ctx.get(editorViewCtx)
              view.dispatch(view.state.tr.delete(view.state.selection.from - 1, view.state.selection.from))

              ctx.get(commandsCtx).call(wrapInHeadingCommand.key, 3)
            })
          }}
          className="cursor-pointer px-6 py-3 hover:bg-gray-200 hover:dark:bg-gray-700"
        >
            Heading 3
          </li>
          <li
          onClick={() => {
            if (loading)
              return

            getEditor().action((ctx) => {
              // remove slash
              const view = ctx.get(editorViewCtx)
              view.dispatch(view.state.tr.delete(view.state.selection.from - 1, view.state.selection.from))

              ctx.get(commandsCtx).call(createCodeBlockCommand.key)
            })
          }}
          className="cursor-pointer px-6 py-3 hover:bg-gray-200 hover:dark:bg-gray-700"
        >
            Code Block
          </li>
          <li
          onMouseDown={(e) => {
            if (loading)
              return

            e.preventDefault()
            getEditor().action((ctx) => {
              // remove slash
              const view = ctx.get(editorViewCtx)
              view.dispatch(view.state.tr.delete(view.state.selection.from - 1, view.state.selection.from))

              ctx.get(commandsCtx).call(insertHrCommand.key)
            })
          }}
          className="cursor-pointer px-6 py-3 hover:bg-gray-200 hover:dark:bg-gray-700"
        >
            Horizontal Rule
          </li>
        </ul>
      </div>
    </div>
  )
}
