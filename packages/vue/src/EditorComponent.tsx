/* Copyright 2021, Milkdown by Mirone. */
import { defineComponent, h } from 'vue'

import { useGetEditor } from './useGetEditor'

export const EditorComponent = defineComponent({
  name: 'MilkdownDomRoot',
  setup: (_, { slots }) => {
    const domRef = useGetEditor()

    return () => <div ref={domRef}>{slots.default?.()}</div>
  },
})
EditorComponent.props = ['editor', 'editorRef']
