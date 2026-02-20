import { h, Fragment, type Ref, defineComponent } from 'vue'

import type { ImageBlockConfig } from '../../config'

import { ImageInput } from '../../../__internal__/components/image-input'
import { ImageViewer } from './image-viewer'

h
Fragment

type Attrs = {
  src: string
  caption: string
  ratio: number
}

export type MilkdownImageBlockProps = {
  selected: Ref<boolean>
  readonly: Ref<boolean>
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
        return (
          <ImageInput
            src={props.src}
            selected={props.selected}
            readonly={props.readonly}
            setLink={(link) => props.setAttr('src', link)}
            imageIcon={props.config.imageIcon}
            uploadButton={props.config.uploadButton}
            confirmButton={props.config.confirmButton}
            uploadPlaceholderText={props.config.uploadPlaceholderText}
            onUpload={props.config.onUpload}
            onImageLoadError={props.config.onImageLoadError}
          />
        )
      }
      return <ImageViewer {...props} />
    }
  },
})
