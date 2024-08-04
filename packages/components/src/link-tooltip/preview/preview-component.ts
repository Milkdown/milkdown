import type { Component } from 'atomico'
import { c, html } from 'atomico'
import type { LinkTooltipConfig } from '../slices'

export interface LinkPreviewProps {
  config: LinkTooltipConfig
  src: string
  onEdit: () => void
  onRemove: () => void
}

export const linkPreviewComponent: Component<LinkPreviewProps> = ({ config, src, onEdit, onRemove }) => {
  const onClickEditButton = (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onEdit?.()
  }

  const onClickRemoveButton = (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onRemove?.()
  }

  const onClickPreview = (e: MouseEvent) => {
    e.preventDefault()
    if (navigator.clipboard && src) {
      navigator.clipboard.writeText(src)
        .then(() => {
          config?.onCopyLink(src)
        }).catch((e) => {
          throw e
        })
    }
  }

  return html`
    <host>
      <div class="link-preview" onmousedown=${onClickPreview}>
        <span class="link-icon">
          ${config?.linkIcon()}
        </span>
        <a href=${src} target="_blank" class="link-display">${src}</a>
        <span class="button link-edit-button" onmousedown=${onClickEditButton}>
          ${config?.editButton()}
        </span>
        <span class="button link-remove-button" onmousedown=${onClickRemoveButton}>
          ${config?.removeButton()}
        </span>
      </div>
    </host>
  `
}

linkPreviewComponent.props = {
  config: Object,
  src: String,
  onEdit: Function,
  onRemove: Function,
}

export const LinkPreviewElement = c(linkPreviewComponent)
