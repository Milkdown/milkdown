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
    if (ref.current) {
      if (!tooltipProvider.current) {
        const provider = new TooltipProvider({
          content: ref.current,
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
    }

    return () => {
      tooltipProvider.current?.destroy()
    }
  }, [])

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
    <div ref={ref} className="bg-white p-4 flex flex-col gap-2 border-gray-300 shadow rounded ring w-96">
      <label className="flex flex-row justify-center items-center gap-4">
        <span className="w-10">Link</span>
        <input
          onBlur={(e) => {
            onChange('src', e)
          }}
          onChange={debounce((e) => {
            onChange('src', e)
          }, 2000)}
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
            focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          defaultValue={src}
        />
      </label>
      <label className="flex flex-row justify-center items-center gap-4">
        <span className="w-10">Alt</span>
        <input
          onBlur={(e) => {
            onChange('alt', e)
          }}
          onChange={debounce((e) => {
            onChange('alt', e)
          }, 2000)}
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
            focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          defaultValue={alt}
        />
      </label>
      <label className="flex flex-row justify-center items-center gap-4">
        <span className="w-10">Title</span>
        <input
          onBlur={(e) => {
            onChange('title', e)
          }}
          onChange={debounce((e) => {
            onChange('title', e)
          }, 2000)}
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
            focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          defaultValue={title}
        />
      </label>
    </div>
  )
}

export const imageTooltip = tooltipFactory('IMAGE')
