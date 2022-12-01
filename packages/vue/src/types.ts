/* Copyright 2021, Milkdown by Mirone. */
import type { Editor } from '@milkdown/core'
import type { Ref } from 'vue'

export type GetEditor = (container: HTMLDivElement) => Editor

export interface EditorInfoCtx {
  getEditorCallback: Ref<GetEditor>
  dom: Ref<HTMLDivElement | null>
  editor: Ref<Editor | undefined>
  loading: Ref<boolean>
}

export interface UseEditorReturn {
  loading: Ref<boolean>
  get: () => Editor | undefined
  editor: EditorInfoCtx
}
