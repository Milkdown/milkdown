/* Copyright 2021, Milkdown by Mirone. */
import type { FC, ReactNode } from 'react'
import React, { useMemo, useRef, useState } from 'react'
import type { Editor } from '@milkdown/core'
import { EditorComponent } from './EditorComponent'

import type { EditorInfoCtx, GetEditor } from './types'
import { editorInfoContext } from './useGetEditor'

export const ReactEditor: FC = () => {
  return <EditorComponent />
}

export const ReactEditorProvider: FC<{ children: ReactNode }> = ({ children }) => {
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
