import { h, Fragment, type Ref, defineComponent } from 'vue'

import type { InlineImageConfig } from '../config'

import { ImageInput } from '../../__internal__/components/image-input'

h
Fragment

type Attrs = {
  src: string
  alt: string
  title: string
}

type MilkdownImageInlineProps = {
  selected: Ref<boolean>
  readonly: Ref<boolean>
  setAttr: <T extends keyof Attrs>(attr: T, value: Attrs[T]) => void
  config: InlineImageConfig
} & {
  [P in keyof Attrs]: Ref<Attrs[P] | undefined>
}

export const MilkdownImageInline = defineComponent<MilkdownImageInlineProps>({
  props: {
    src: {
      type: Object,
      required: true,
    },
    alt: {
      type: Object,
      required: true,
    },
    title: {
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
    const { src, alt, title } = props
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
            className="empty-image-inline"
          />
        )
      }
      return (
        <img
          class="image-inline"
          src={src.value}
          alt={alt.value}
          title={title.value}
        />
      )
    }
  },
})
