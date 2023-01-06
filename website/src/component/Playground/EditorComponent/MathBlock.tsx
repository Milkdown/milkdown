/* Copyright 2021, Milkdown by Mirone. */
import { katexOptionsCtx } from '@milkdown/plugin-math'
import { useInstance } from '@milkdown/react'
import { useNodeViewContext } from '@prosemirror-adapter/react'
import * as Tabs from '@radix-ui/react-tabs'
import katex from 'katex'
import type { FC } from 'react'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'

export const MathBlock: FC = () => {
  const { node, setAttrs, selected } = useNodeViewContext()
  const code = useMemo(() => node.attrs.value, [node.attrs.value])
  const codePanel = useRef<HTMLDivElement>(null)
  const codeInput = useRef<HTMLTextAreaElement>(null)
  const [value, setValue] = useState('preview')
  const [loading, getEditor] = useInstance()

  useLayoutEffect(() => {
    requestAnimationFrame(() => {
      if (!codePanel.current || value !== 'preview' || loading)
        return

      try {
        katex.render(code, codePanel.current, getEditor().ctx.get(katexOptionsCtx.key))
      }
      catch {

      }
    })
  }, [code, getEditor, loading, value])

  return (
    <Tabs.Root
      contentEditable={false}
      className={selected ? 'ring-2 ring-offset-2' : ''}
      value={value}
      onValueChange={(value) => {
        setValue(value)
      }}>
      <Tabs.List className="border-b border-gray-200 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
        <div className="-mb-px flex flex-wrap">
          <Tabs.Trigger
            value="preview"
            className={['inline-block p-4 rounded-t-lg border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300', value === 'preview' ? 'text-nord9' : ''].join(' ')}
          >
            Preview
          </Tabs.Trigger>
          <Tabs.Trigger
            value="source"
            className={['inline-block p-4 rounded-t-lg border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300', value === 'source' ? 'text-nord9' : ''].join(' ')}
          >
            Source
          </Tabs.Trigger>
        </div>
      </Tabs.List>
      <Tabs.Content value="preview">
        <div className="py-3 text-center" ref={codePanel} />
      </Tabs.Content>
      <Tabs.Content value="source" className="relative">
        <textarea
          className="block h-48 w-full bg-slate-800 font-mono text-gray-50"
          ref={codeInput}
          defaultValue={code}
        />
        <button
          className="bg-nord8 dark:bg-nord9 absolute right-0 bottom-full mb-1 inline-flex items-center justify-center rounded border border-gray-600 px-6 py-2 text-base font-medium leading-6 text-gray-50 shadow-sm hover:bg-blue-200 focus:ring-2 focus:ring-offset-2"
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
