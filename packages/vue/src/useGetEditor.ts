/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx } from '@milkdown/core'
import { vueRendererCallOutOfScope } from '@milkdown/exception'
import type { MarkViewConstructor, NodeViewConstructor } from '@milkdown/prose/view'
import type { DefineComponent, InjectionKey } from 'vue'
import { inject, onMounted, onUnmounted, ref } from 'vue'

import type { EditorInfoCtx, GetEditor, RenderOptions, RenderVue } from './types'
import { editorInfoCtxKey } from '.'

export const rendererKey: InjectionKey<
    (component: DefineComponent, options?: RenderOptions) => (ctx: Ctx) => NodeViewConstructor | MarkViewConstructor
> = Symbol('rendererKey')

export const useGetEditor = (getEditor: GetEditor) => {
  const renderVue = inject<RenderVue>(rendererKey, () => {
    throw vueRendererCallOutOfScope()
  })
  const { dom, loading, editor: editorRef } = inject(editorInfoCtxKey, {} as EditorInfoCtx)
  const lock = ref(false)

  onMounted(() => {
    if (!dom.value)
      return

    const editor = getEditor(dom.value, renderVue)
    if (!editor)
      return

    if (lock.value)
      return

    loading.value = true
    lock.value = true

    editor
      .create()
      .then((editor) => {
        editorRef.value = editor
      })
      .finally(() => {
        loading.value = false
        lock.value = false
      })
      .catch(e => console.error(e))
  })
  onUnmounted(() => {
    editorRef.value?.destroy()
  })
}
