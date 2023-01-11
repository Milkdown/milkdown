/* Copyright 2021, Milkdown by Mirone. */

import { commandsCtx } from '@milkdown/core'
import { TooltipProvider, tooltipFactory } from '@milkdown/plugin-tooltip'
import { updateImageCommand } from '@milkdown/preset-commonmark'
import { NodeSelection } from '@milkdown/prose/state'
import { useInstance } from '@milkdown/react'
import { usePluginViewContext } from '@prosemirror-adapter/react'
import debounce from 'lodash.debounce'
import type { FC } from 'react'
import { useEffect, useRef } from 'react'

export const ImageTooltip: FC = () => {
  const ref = useRef<HTMLDivElement>(null)
  const { view, prevState } = usePluginViewContext()
  const tooltipProvider = useRef<TooltipProvider>()
  const { state } = view
  const { selection } = state
  const imageNode = state.doc.nodeAt(selection.from)
  const [loading, getEditor] = useInstance()
  const { src, alt, title } = imageNode?.attrs ?? {}

  useEffect(() => {
    if (ref.current && !tooltipProvider.current && !loading) {
      const provider = new TooltipProvider({
        content: ref.current,
        tippyOptions: {
          zIndex: 30,
        },
        shouldShow: (view) => {
          const { selection } = view.state
          const { empty, from } = selection

          const isTooltipChildren = provider.element.contains(document.activeElement)

          const notHasFocus = !view.hasFocus() && !isTooltipChildren

          const isReadonly = !view.editable

          if (notHasFocus || empty || isReadonly)
            return false

          if (selection instanceof NodeSelection && view.state.doc.nodeAt(from)?.type.name === 'image')
            return true

          return false
        },
      })

      tooltipProvider.current = provider
    }

    return () => {
      tooltipProvider.current?.destroy()
    }
  }, [loading])

  useEffect(() => {
    tooltipProvider.current?.update(view, prevState)
  })

  const onChange = (key: string, e: React.FocusEvent<HTMLInputElement, Element>) => {
    if (loading)
      return

    const value = e.target.value
    if (value === imageNode?.attrs[key])
      return

    getEditor().action((ctx) => {
      const commands = ctx.get(commandsCtx)
      commands.call(updateImageCommand.key, {
        [key]: (e.target as HTMLInputElement).value,
      })
    })
  }

  return (
    <div>
      <div ref={ref} className="flex w-96 flex-col gap-2 rounded border-gray-300 bg-white p-4 shadow ring dark:border-gray-600 dark:bg-black">
        <label className="flex flex-row items-center justify-center gap-4">
          <span className="w-10">Link</span>
          <input
          onBlur={(e) => {
            onChange('src', e)
          }}
          onChange={debounce((e) => {
            onChange('src', e)
          }, 2000)}
          type="text"
          className="mt-1 block w-full rounded-md bg-gray-300 shadow-sm focus:border-indigo-300
            focus:ring focus:ring-indigo-200/50 dark:bg-gray-600"
          defaultValue={src}
        />
        </label>
        <label className="flex flex-row items-center justify-center gap-4">
          <span className="w-10">Alt</span>
          <input
          onBlur={(e) => {
            onChange('alt', e)
          }}
          onChange={debounce((e) => {
            onChange('alt', e)
          }, 2000)}
          type="text"
          className="mt-1 block w-full rounded-md bg-gray-300 shadow-sm focus:border-indigo-300
            focus:ring focus:ring-indigo-200/50 dark:bg-gray-600"
          defaultValue={alt}
        />
        </label>
        <label className="flex flex-row items-center justify-center gap-4">
          <span className="w-10">Title</span>
          <input
          onBlur={(e) => {
            onChange('title', e)
          }}
          onChange={debounce((e) => {
            onChange('title', e)
          }, 2000)}
          type="text"
          className="mt-1 block w-full rounded-md bg-gray-300 shadow-sm focus:border-indigo-300
            focus:ring focus:ring-indigo-200/50 dark:bg-gray-600"
          defaultValue={title}
        />
        </label>
      </div>
    </div>
  )
}

export const imageTooltip = tooltipFactory('IMAGE')
