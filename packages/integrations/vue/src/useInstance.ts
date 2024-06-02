import type { Editor } from '@milkdown/core'
import type { Ref } from 'vue'
import { inject } from 'vue'
import { editorInfoCtxKey } from './Editor'

export type Instance = [Ref<true>, () => undefined] | [Ref<false>, () => Editor]

export function useInstance(): Instance {
  const editorInfo = inject(editorInfoCtxKey)!

  return [editorInfo.loading, () => editorInfo.editor.value] as Instance
}
