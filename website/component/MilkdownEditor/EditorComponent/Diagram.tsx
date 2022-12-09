/* Copyright 2021, Milkdown by Mirone. */
import { useNodeViewContext } from '@prosemirror-adapter/react'
import * as Tabs from '@radix-ui/react-tabs'
import mermaid from 'mermaid'
import type { FC } from 'react'
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'

export const Diagram: FC = () => {
  const { node, setAttrs, selected } = useNodeViewContext()
  const code = useMemo(() => node.attrs.value, [node.attrs.value])
  const id = node.attrs.identity
  const codeInput = useRef<HTMLTextAreaElement>(null)
  const [value, setValue] = useState('preview')
  const codePanel = useRef<HTMLDivElement>(null)

  const renderMermaid = useCallback((canRetry = 3) => {
    const container = codePanel.current
    if (!container)
      return

    try {
      if (code.length === 0)
        return

      mermaid.render(id, code, (svg, bind) => {
        container.innerHTML = svg
        bind?.(container)
      })
    }
    catch (e) {
      console.error(e)
      if (canRetry === 0)
        return

      setTimeout(() => {
        renderMermaid(canRetry - 1)
      }, 200)
    }
  }, [code, id])

  useLayoutEffect(() => {
    requestAnimationFrame(() => {
      renderMermaid()
    })
  }, [renderMermaid, value])

  return (
    <Tabs.Root
      contentEditable={false}
      className={selected ? 'ring-2 ring-offset-2' : ''}
      value={value}
      onValueChange={(value) => {
        setValue(value)
      }}>
      <Tabs.List className="text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
        <div className="flex flex-wrap -mb-px">
          <Tabs.Trigger
            value="preview"
            className={['inline-block p-4 rounded-t-lg border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300', value === 'preview' ? 'text-blue-600' : ''].join(' ')}
          >
            Preview
          </Tabs.Trigger>
          <Tabs.Trigger
            value="source"
            className={['inline-block p-4 rounded-t-lg border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300', value === 'source' ? 'text-blue-600' : ''].join(' ')}
          >
            Source
          </Tabs.Trigger>
        </div>
      </Tabs.List>
      <Tabs.Content value="preview" forceMount>
        <div ref={codePanel} className={['flex py-3 justify-center', value !== 'preview' ? 'hidden' : ''].join(' ')} />
      </Tabs.Content>
      <Tabs.Content value="source" className="relative">
        <textarea
          className="block w-full h-48 font-mono bg-slate-800 text-gray-50"
          ref={codeInput}
          defaultValue={code}
        />
        <button
          className="absolute right-0 mb-1 bottom-full inline-flex items-center justify-center px-6 py-2 text-base font-medium leading-6 bg-blue-400 text-gray-50 border border-gray-600 rounded shadow-sm hover:bg-blue-200 focus:ring-2 focus:ring-offset-2"
          onClick={() => {
            setAttrs({ value: codeInput.current?.value || '' })
            setValue('preview')
          }}>
          OK
        </button>
      </Tabs.Content>
    </Tabs.Root>
  )
}
