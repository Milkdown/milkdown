/* Copyright 2021, Milkdown by Mirone. */
import { ProsemirrorAdapterProvider } from '@prosemirror-adapter/vue'
import type {
  InjectionKey,
} from 'vue'
import {
  defineComponent, h, provide,
} from 'vue'

import { EditorComponent } from './EditorComponent'
import type { EditorInfoCtx } from './types'

export const editorInfoCtxKey: InjectionKey<EditorInfoCtx> = Symbol('editorInfoCtxKey')

export const VueEditor = defineComponent<{ editor: EditorInfoCtx }>({
  name: 'MilkdownVueRoot',
  setup: (props) => {
    const { getEditorCallback, dom, editor, loading } = props.editor

    provide(editorInfoCtxKey, {
      getEditorCallback,
      dom,
      editor,
      loading,
    })

    return () => {
      return (
        <ProsemirrorAdapterProvider>
          <EditorComponent />
        </ProsemirrorAdapterProvider>
      )
    }
  },
})
VueEditor.props = ['editor', 'editorRef']
