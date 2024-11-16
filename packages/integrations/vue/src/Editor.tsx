import type { Crepe } from '@milkdown/crepe'
import type { Editor } from '@milkdown/core'
import type { InjectionKey, Ref } from 'vue'
import {
  Fragment,
  defineComponent,
  h,
  provide,
  ref,
} from 'vue'

import type { EditorInfoCtx, GetEditor } from './types'
import { useGetEditor } from './useGetEditor'

h
Fragment

export const editorInfoCtxKey: InjectionKey<EditorInfoCtx> = Symbol('editorInfoCtxKey')

export const Milkdown = defineComponent({
  name: 'Milkdown',
  setup: () => {
    const domRef = useGetEditor()

    return () => h('div', {
      'data-milkdown-root': true,
      ref: domRef,
    })
  },
})

export const MilkdownProvider = defineComponent({
  name: 'MilkdownProvider',
  setup: (_, { slots }) => {
    const dom = ref<HTMLDivElement | null>(null)
    const editorFactory = ref<GetEditor | undefined>(undefined)
    const editor = ref<Editor | undefined>(undefined) as Ref<Editor | undefined>
    const crepe = ref<Crepe | undefined>(undefined) as Ref<Crepe | undefined>
    const loading = ref(true)

    provide(editorInfoCtxKey, {
      loading,
      dom,
      editor,
      editorFactory,
      crepe,
    })

    return () => slots.default?.()
  },
})
