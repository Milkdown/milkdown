import type { Crepe } from '@milkdown/crepe'
import type { Editor } from '@milkdown/core'
import type { Ref } from 'vue'

export type GetEditor = (container: HTMLDivElement) => Editor | Crepe

export interface EditorInfoCtx {
  dom: Ref<HTMLDivElement | null>
  editor: Ref<Editor | undefined>
  editorFactory: Ref<GetEditor | undefined>
  loading: Ref<boolean>
  crepe: Ref<Crepe | undefined>
}

export interface UseEditorReturn {
  loading: Ref<boolean>
  get: () => Editor | undefined
  getCrepe: () => Crepe | undefined
}
