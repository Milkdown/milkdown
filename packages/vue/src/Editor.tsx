/* Copyright 2021, Milkdown by Mirone. */
/* eslint-disable vue/one-component-per-file */
import type { Editor } from '@milkdown/core'
import type { InjectionKey } from 'vue'
import {
  Fragment,
  defineComponent,
  h,
  provide,
  ref,
} from 'vue'

import type { EditorInfoCtx, GetEditor } from './types'
import { useGetEditor } from './useGetEditor'

export const editorInfoCtxKey: InjectionKey<EditorInfoCtx> = Symbol('editorInfoCtxKey')

export const Milkdown = defineComponent({
  name: 'Milkdown',
  setup: () => {
    const domRef = useGetEditor()

    return () => <div data-milkdown-root ref={domRef} />
  },
})

export const MilkdownProvider = defineComponent({
  name: 'MilkdownProvider',
  setup: (_, { slots }) => {
    const dom = ref<HTMLDivElement | null>(null)
    const editorFactory = ref<GetEditor | undefined>(undefined)
    const editor = ref<Editor | undefined>(undefined)
    const loading = ref(true)

    provide(editorInfoCtxKey, {
      loading,
      dom,
      editor,
      editorFactory,
    })

    return () => <>{slots.default?.()}</>
  },
})
