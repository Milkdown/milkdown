import { h, Fragment, type Ref, defineComponent } from 'vue'
import type { ImageBlockConfig } from '../../config'
import { ImageViewer } from './image-viewer'
import { ImageInput } from './image-input'

h
Fragment

type Attrs = {
  src: string
  caption: string
  ratio: number
}

export type MilkdownImageBlockProps = {
  selected: Ref<boolean | undefined>
  readonly: Ref<boolean | undefined>
  setAttr: <T extends keyof Attrs>(attr: T, value: Attrs[T]) => void
  config: ImageBlockConfig
} & {
  [P in keyof Attrs]: Ref<Attrs[P] | undefined>
}

export const MilkdownImageBlock = defineComponent<MilkdownImageBlockProps>({
  props: {
    src: {
      type: Object,
      required: true,
    },
    caption: {
      type: Object,
      required: true,
    },
    ratio: {
      type: Object,
      required: true,
    },
    selected: {
      type: Object,
      required: true,
    },
    readonly: {
      type: Object,
      required: true,
    },
    setAttr: {
      type: Function,
      required: true,
    },
    config: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const { src } = props

    return () => {
      if (!src.value?.length) {
        return <ImageInput {...props} />
      }
      return <ImageViewer {...props} />
    }
  },
})
