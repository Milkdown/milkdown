/* Copyright 2021, Milkdown by Mirone. */
import { useContext } from 'react'
import { editorInfoContext } from './useGetEditor'

export const useCtx = () => {
  const editorInfo = useContext(editorInfoContext)

  return editorInfo.editor.current?.ctx
}
