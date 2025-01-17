import type { Editor } from '@milkdown/kit/core'
import type { Ref } from 'vue'
import { Fragment, defineComponent, h, provide, ref } from 'vue'

import type { GetEditor } from './types'
import { useGetEditor } from './use-get-editor'
import { editorInfoCtxKey } from './consts'

h
Fragment

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
    const editor = ref<Editor | undefined>(undefined) as Ref<Editor | undefined>
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
