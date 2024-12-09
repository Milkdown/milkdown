import type { InjectionKey } from 'vue'
import type { EditorInfoCtx } from './types'

export const editorInfoCtxKey: InjectionKey<EditorInfoCtx> =
  Symbol('editorInfoCtxKey')
