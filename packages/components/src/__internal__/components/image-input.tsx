import clsx from 'clsx'
import { customAlphabet } from 'nanoid'
import { defineComponent, ref, h, type Ref } from 'vue'

import { Icon } from './icon'

h

const nanoid = customAlphabet('abcdefg', 8)

type ImageInputProps = {
  src: Ref<string | undefined>
  selected: Ref<boolean>
  readonly: Ref<boolean>
  setLink: (link: string) => void

  imageIcon?: string
  uploadButton?: string
  confirmButton?: string
  uploadPlaceholderText?: string

  className?: string

  onUpload: (file: File) => Promise<string>
  onImageLoadError?: (event: Event) => void | Promise<void>
}

export const ImageInput = defineComponent<ImageInputProps>({
  props: {
    src: {
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
    imageIcon: {
      type: String,
      required: false,
    },
    uploadButton: {
      type: String,
      required: false,
    },
    confirmButton: {
      type: String,
      required: false,
    },
    uploadPlaceholderText: {
      type: String,
      required: false,
    },
    onUpload: {
      type: Function,
      required: true,
    },
    onImageLoadError: {
      type: Function,
      required: false,
    },
  },
  setup({
    readonly,
    src,
    setLink,
    onUpload,
    imageIcon,
    uploadButton,
    confirmButton,
    uploadPlaceholderText,
    className,
    onImageLoadError,
  }) {
    const focusLinkInput = ref(false)
    const linkInputRef = ref<HTMLInputElement>()
    const currentLink = ref(src.value ?? '')
    const uuid = ref(nanoid())
    const hidePlaceholder = ref(src.value?.length !== 0)
    const onEditLink = (e: Event) => {
      const target = e.target as HTMLInputElement
      const value = target.value
      hidePlaceholder.value = value.length !== 0
      currentLink.value = value
    }

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        setLink(linkInputRef.value?.value ?? '')
      }
    }

    const onConfirmLinkInput = () => {
      setLink(linkInputRef.value?.value ?? '')
    }

    const onUploadFile = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      onUpload(file)
        .then((url) => {
          if (!url) return

          setLink(url)
          hidePlaceholder.value = true
        })
        .catch((err) => {
          console.error('An error occurred while uploading image')
          console.error(err)
        })
    }

    return () => {
      return (
        <div class={clsx('image-edit', className)}>
          <Icon icon={imageIcon} class="image-icon" />
          <div class={clsx('link-importer', focusLinkInput.value && 'focus')}>
            <input
              ref={linkInputRef}
              draggable="true"
              onDragstart={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              disabled={readonly.value}
              class="link-input-area"
              value={currentLink.value}
              onInput={onEditLink}
              onKeydown={onKeydown}
              onFocus={() => (focusLinkInput.value = true)}
              onBlur={() => (focusLinkInput.value = false)}
            />
            {!hidePlaceholder.value && (
              <div class="placeholder">
                <input
                  disabled={readonly.value}
                  class="hidden"
                  id={uuid.value}
                  type="file"
                  accept="image/*"
                  onChange={onUploadFile}
                />
                <label class="uploader" for={uuid.value}>
                  <Icon icon={uploadButton} />
                </label>
                <span class="text" onClick={() => linkInputRef.value?.focus()}>
                  {uploadPlaceholderText}
                </span>
              </div>
            )}
          </div>
          {currentLink.value && (
            <>
              <div class="image-preview">
                <img
                  src={currentLink.value}
                  alt=""
                  onError={(e) =>
                    Promise.resolve(onImageLoadError?.(e)).catch(() => {})
                  }
                />
              </div>
              <div class="confirm" onClick={() => onConfirmLinkInput()}>
                <Icon icon={confirmButton} />
              </div>
            </>
          )}
        </div>
      )
    }
  },
})
