/* Copyright 2021, Milkdown by Mirone. */
import type { Editor } from '@milkdown/core'
import type { Dispatch, MutableRefObject, SetStateAction } from 'react'

export type GetEditor = (container: HTMLElement) => Editor | undefined

export interface UseEditorReturn {
  readonly loading: boolean
  readonly get: () => Editor | undefined
}

export interface EditorInfoCtx {
  loading: boolean
  setLoading: Dispatch<SetStateAction<boolean>>
  dom: MutableRefObject<HTMLDivElement | undefined>
  editor: MutableRefObject<Editor | undefined>
  editorFactory: GetEditor | undefined
  setEditorFactory: Dispatch<SetStateAction<GetEditor | undefined>>
}
