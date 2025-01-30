import type { Crepe } from '@milkdown/crepe'
import type { Editor } from '@milkdown/kit/core'
import type { Dispatch, RefObject, SetStateAction } from 'react'

export type GetEditor = (container: HTMLElement) => Editor | Crepe | undefined
export interface UseEditorReturn {
  readonly loading: boolean
  readonly get: () => Editor | undefined
}

export interface EditorInfoCtx {
  loading: boolean
  setLoading: Dispatch<SetStateAction<boolean>>
  dom: RefObject<HTMLDivElement | undefined>
  editor: RefObject<Editor | undefined>
  editorFactory: GetEditor | undefined
  setEditorFactory: Dispatch<SetStateAction<GetEditor | undefined>>
}
