/* Copyright 2021, Milkdown by Mirone. */
import type { Editor } from '@milkdown/core'
import type { FC, ReactNode } from 'react'
import React, { useMemo, useRef, useState } from 'react'

import type { EditorInfoCtx, GetEditor } from './types'
import { editorInfoContext, useGetEditor } from './useGetEditor'

export const Milkdown: FC = () => {
  const domRef = useGetEditor()

  return <div data-milkdown-root ref={domRef} />
}

export const MilkdownProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const dom = useRef<HTMLDivElement | undefined>(undefined)
  const [editorFactory, setEditorFactory] = useState<GetEditor | undefined>(undefined)
  const editor = useRef<Editor>()
  const [loading, setLoading] = useState(true)

  const editorInfoCtx = useMemo<EditorInfoCtx>(() => ({
    loading,
    dom,
    editor,
    setLoading,
    editorFactory,
    setEditorFactory,
  }), [loading, editorFactory])

  return (
    <editorInfoContext.Provider value={editorInfoCtx}>
      {children}
    </editorInfoContext.Provider>
  )
}
