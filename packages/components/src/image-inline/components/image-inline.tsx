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

export type MilkdownImageInlineProps = {
  selected: Ref<boolean>
  readonly: Ref<boolean>
  setLink: (link: string) => void
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
    setLink: {
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
            setLink={props.setLink}
            imageIcon={props.config.imageIcon()}
            uploadButton={props.config.uploadButton()}
            confirmButton={props.config.confirmButton()}
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
