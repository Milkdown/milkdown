import { sanitizeLinkHref } from '@milkdown/preset-commonmark'
import { computed, defineComponent, type Ref, h } from 'vue'

import type { LinkTooltipConfig } from '../slices'

import { Icon } from '../../__internal__/components/icon'
import { keepAlive } from '../../__internal__/keep-alive'

keepAlive(h)

type PreviewLinkProps = {
  config: Ref<LinkTooltipConfig>
  src: Ref<string>
  onEdit: Ref<() => void>
  onRemove: Ref<() => void>
}

export const PreviewLink = defineComponent<PreviewLinkProps>({
  props: {
    config: {
      type: Object,
      required: true,
    },
    src: {
      type: Object,
      required: true,
    },
    onEdit: {
      type: Object,
      required: true,
    },
    onRemove: {
      type: Object,
      required: true,
    },
  },
  setup({ config, src, onEdit, onRemove }) {
    // The preview anchor lives outside the contenteditable area, so a raw
    // `javascript:` href would execute on click. Sanitize the navigable href
    // while still showing the original value as text.
    const safeHref = computed(() => sanitizeLinkHref(src.value))

    const onClickEditButton = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      onEdit.value()
    }

    const onClickRemoveButton = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      onRemove.value()
    }

    const onClickPreview = (e: Event) => {
      e.preventDefault()
      const link = src.value
      if (navigator.clipboard && link) {
        navigator.clipboard
          .writeText(link)
          .then(() => {
            config.value.onCopyLink(link)
          })
          .catch((e) => console.error(e))
      }
    }

    return () => {
      return (
        <div class="link-preview">
          <Icon
            class="button link-icon"
            icon={config.value.linkIcon}
            onClick={onClickPreview}
          />
          <a
            href={safeHref.value}
            target="_blank"
            rel="noopener noreferrer"
            class="link-display"
          >
            {src.value}
          </a>
          <Icon
            class="button link-edit-button"
            icon={config.value.editButton}
            onClick={onClickEditButton}
          />
          <Icon
            class="button link-remove-button"
            icon={config.value.removeButton}
            onClick={onClickRemoveButton}
          />
        </div>
      )
    }
  },
})
