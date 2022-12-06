/* Copyright 2021, Milkdown by Mirone. */
import { useInstance } from '@milkdown/react'
import { useNodeViewContext } from '@prosemirror-adapter/react'
import * as Tabs from '@radix-ui/react-tabs'
import mermaid from 'mermaid'
import type { FC } from 'react'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'

export const Diagram: FC = () => {
  const { node, setAttrs } = useNodeViewContext()
  const code = useMemo(() => node.attrs.value, [node.attrs.value])
  const id = useMemo(() => node.attrs.identity, [node.attrs.identity])
  const codePanel = useRef<HTMLDivElement>(null)
  const codeInput = useRef<HTMLTextAreaElement>(null)
  const [value, setValue] = useState('preview')
  const [loading, getEditor] = useInstance()

  useLayoutEffect(() => {
    requestAnimationFrame(() => {
      if (!codePanel.current || value !== 'preview' || loading)
        return

      const svg = mermaid.render(id, code)
      codePanel.current.innerHTML = svg
    })
  }, [code, getEditor, id, loading, value])

  return (
    <Tabs.Root value={value} onValueChange={(value) => {
      setValue(value)
    }}>
      <Tabs.List>
        <Tabs.Trigger value="preview">Preview</Tabs.Trigger>
        <Tabs.Trigger value="source">Source</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="preview">
        <div ref={codePanel} />
      </Tabs.Content>
      <Tabs.Content value="source">
        <textarea
          onMouseDown={(e) => {
            e.stopPropagation()
          }}
          onKeyDown={e => e.stopPropagation()}
          ref={codeInput}
          defaultValue={code}
        />
        <button onClick={() => {
          setAttrs({ value: codeInput.current?.value || '' })
          setValue('preview')
        }}>OK</button>
      </Tabs.Content>
    </Tabs.Root>
  )
}
