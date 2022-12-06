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

    const root = getEditor().ctx.get(editorViewCtx).dom

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
    <div role="tooltip" className="rounded bg-gray-50 shadow-lg w-96 ring-2" ref={ref}>
      <ul className="list-none m-0">
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
          className="px-6 py-3 cursor-pointer hover:bg-gray-200"
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
          className="px-6 py-3 cursor-pointer hover:bg-gray-200"
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
          className="px-6 py-3 cursor-pointer hover:bg-gray-200"
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
          className="px-6 py-3 cursor-pointer hover:bg-gray-200"
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
          className="px-6 py-3 cursor-pointer hover:bg-gray-200"
        >
          Horizontal Rule
        </li>
      </ul>
    </div>
  )
}
