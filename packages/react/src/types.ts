/* Copyright 2021, Milkdown by Mirone. */
import type { Editor } from '@milkdown/core'
import type { MutableRefObject } from 'react'

export type GetEditor = (container: HTMLElement) => Editor | undefined

export interface UseEditorReturn {
  readonly loading: boolean
  readonly get: () => Editor | undefined
  readonly editor: EditorInfoCtx
}

export interface EditorInfoCtx {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  dom: MutableRefObject<HTMLDivElement | undefined>
  editor: MutableRefObject<Editor | undefined>
  getEditorCallback: GetEditor
}

