/* Copyright 2021, Milkdown by Mirone. */
import type { Editor } from '@milkdown/core'
import { defineComponent, h, inject } from 'vue'

import { editorInfoCtxKey } from './Editor'
import type { EditorInfoCtx, GetEditor } from './types'
import { useGetEditor } from './useGetEditor'

export const EditorComponent = defineComponent<{ editor: GetEditor; editorRef?: EditorRef }>({
  name: 'MilkdownDomRoot',
  setup: (props, { slots }) => {
    useGetEditor(props.editor)
    const ctx = inject(editorInfoCtxKey, {} as EditorInfoCtx)

    if (props.editorRef) {
      // eslint-disable-next-line vue/no-mutating-props
      props.editorRef.get = () => ctx.editor.value
      // eslint-disable-next-line vue/no-mutating-props
      props.editorRef.dom = () => ctx.dom.value
    }

    return () => <div ref={ctx.dom}>{slots.default?.()}</div>
  },
})
EditorComponent.props = ['editor', 'editorRef']

export interface EditorRef { get: () => Editor | undefined; dom: () => HTMLDivElement | null }
