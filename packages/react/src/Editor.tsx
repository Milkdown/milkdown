/* Copyright 2021, Milkdown by Mirone. */
import { ProsemirrorAdapterProvider } from '@prosemirror-adapter/react'
import type { FC } from 'react'
import React, { useMemo } from 'react'
import { EditorComponent } from './EditorComponent'

import type { EditorInfoCtx } from './types'
import { editorInfoContext } from './useGetEditor'

interface EditorProps {
  editor: EditorInfoCtx
}

export const ReactEditor: FC<EditorProps> = ({ editor: editorInfo }) => {
  const { getEditorCallback, dom, editor, setLoading } = editorInfo

  const ctx = useMemo<EditorInfoCtx>(() => ({
    dom,
    editor,
    setLoading,
    getEditorCallback,
  }), [dom, editor, setLoading, getEditorCallback])

  return (
    <ProsemirrorAdapterProvider>
      <editorInfoContext.Provider value={ctx}>
        <EditorComponent />
      </editorInfoContext.Provider>
    </ProsemirrorAdapterProvider>
  )
}
