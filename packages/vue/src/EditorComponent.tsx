/* Copyright 2021, Milkdown by Mirone. */
import { defineComponent, h, inject } from 'vue'

import { editorInfoCtxKey } from './Editor'
import type { EditorInfoCtx } from './types'
import { useGetEditor } from './useGetEditor'

export const EditorComponent = defineComponent({
  name: 'MilkdownDomRoot',
  setup: (_, { slots }) => {
    useGetEditor()
    const ctx = inject(editorInfoCtxKey, {} as EditorInfoCtx)

    return () => <div ref={ctx.dom}>{slots.default?.()}</div>
  },
})
EditorComponent.props = ['editor', 'editorRef']
