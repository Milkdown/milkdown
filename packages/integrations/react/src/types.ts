import type { Crepe } from '@milkdown/crepe'
import type { Editor } from '@milkdown/core'
import type { Dispatch, MutableRefObject, SetStateAction } from 'react'

export type GetEditor = (container: HTMLElement) => Editor | Crepe | undefined

export interface UseEditorReturn {
  readonly loading: boolean
  readonly get: () => Editor | undefined
  readonly getCrepe: () => Crepe | undefined
}

export interface EditorInfoCtx {
  loading: boolean
  setLoading: Dispatch<SetStateAction<boolean>>
  dom: MutableRefObject<HTMLDivElement | undefined>
  editor: MutableRefObject<Editor | undefined>
  crepe: MutableRefObject<Crepe | undefined>
  editorFactory: GetEditor | undefined
  setEditorFactory: Dispatch<SetStateAction<GetEditor | undefined>>
}
