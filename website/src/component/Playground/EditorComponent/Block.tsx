/* Copyright 2021, Milkdown by Mirone. */

import { commandsCtx } from '@milkdown/core'
import { BlockProvider } from '@milkdown/plugin-block'
import { turnIntoTextCommand, wrapInHeadingCommand } from '@milkdown/preset-commonmark'
import { useInstance } from '@milkdown/react'
import { usePluginViewContext } from '@prosemirror-adapter/react'
import { useEffect, useRef, useState } from 'react'

export const Block = () => {
  const { view } = usePluginViewContext()
  const slashProvider = useRef<BlockProvider>()
  const [element, setElement] = useState<HTMLDivElement | null>(null)
  const [loading, get] = useInstance()
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    if (element && !loading) {
      slashProvider.current ??= new BlockProvider({
        ctx: get().ctx,
        content: element,
        tippyOptions: {
          zIndex: 20,
          onBeforeUpdate: () => setShowMenu(false),
          onClickOutside: () => setShowMenu(false),
          onHide: () => setShowMenu(false),
        },
      })
    }

    return () => {
      slashProvider.current?.destroy()
    }
  }, [loading, get, element])

  useEffect(() => {
    slashProvider.current?.update(view)
  })

  return (
    <div>
      <div className={['relative cursor-grab rounded-full border-2 bg-gray-50', showMenu ? 'ring-2 ring-offset-2' : ''].join(' ')} ref={setElement}>
        <div onClick={() => setShowMenu(x => !x)}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
          </svg>
        </div>
        {
        showMenu
        && <div className="top-full mt-2 cursor-pointer absolute w-60 border-2 bg-gray-50 shadow rounded">
          <div
            onClick={() => {
              if (loading)
                return

              const commands = get().ctx.get(commandsCtx)
              commands.call(wrapInHeadingCommand.key, 1)
            }}
            className="px-6 py-3 hover:bg-gray-200"
          >
            Heading 1
          </div>
          <div
            onClick={() => {
              if (loading)
                return

              const commands = get().ctx.get(commandsCtx)
              commands.call(wrapInHeadingCommand.key, 2)
            }}
            className="px-6 py-3 hover:bg-gray-200"
          >
            Heading 2
          </div>
          <div
            onClick={() => {
              if (loading)
                return

              const commands = get().ctx.get(commandsCtx)
              commands.call(wrapInHeadingCommand.key, 3)
            }}
            className="px-6 py-3 hover:bg-gray-200"
          >
            Heading 3
          </div>
          <div
            onClick={() => {
              if (loading)
                return

              const commands = get().ctx.get(commandsCtx)
              commands.call(turnIntoTextCommand.key)
            }}
            className="px-6 py-3 hover:bg-gray-200"
          >
            Text
          </div>
        </div>
      }
      </div>
    </div>
  )
}
