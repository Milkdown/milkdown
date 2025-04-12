import { defineComponent, ref, h } from 'vue'
import type { MilkdownImageBlockProps } from './image-block'
import clsx from 'clsx'
import { customAlphabet } from 'nanoid'
import { Icon } from '../../../__internal__/icon'

h

const nanoid = customAlphabet('abcdefg', 8)

export const ImageInput = defineComponent<MilkdownImageBlockProps>({
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
  setup({ config, readonly, src, setAttr }) {
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
        setAttr('src', linkInputRef.value?.value ?? '')
      }
    }

    const onConfirmLinkInput = () => {
      setAttr('src', linkInputRef.value?.value ?? '')
    }

    const onUpload = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      config
        .onUpload(file)
        .then((url) => {
          if (!url) return

          setAttr('src', url)
          hidePlaceholder.value = true
        })
        .catch((err) => {
          console.error('An error occurred while uploading image')
          console.error(err)
        })
    }

    return () => {
      return (
        <div class="image-edit">
          <Icon icon={config.imageIcon()} class="image-icon" />
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
                  onChange={onUpload}
                />
                <label class="uploader" for={uuid.value}>
                  <Icon icon={config.uploadButton()} />
                </label>
                <span class="text" onClick={() => linkInputRef.value?.focus()}>
                  {config.uploadPlaceholderText}
                </span>
              </div>
            )}
          </div>
          {currentLink.value && (
            <div class="confirm" onClick={() => onConfirmLinkInput()}>
              <Icon icon={config.confirmButton()} />
            </div>
          )}
        </div>
      )
    }
  },
})
