/* Copyright 2021, Milkdown by Mirone. */
import type { Component } from 'atomico'
import { html } from 'atomico'
import { useCssLightDom } from '@atomico/hooks/use-css-light-dom'
import type { LinkTooltipConfig } from '../slices'
import { style } from './style'

export interface LinkPreviewProps {
  config: LinkTooltipConfig
  src: string
  onEdit: () => void
  onRemove: () => void
}

export const linkPreviewComponent: Component<LinkPreviewProps> = ({ config, src, onEdit, onRemove }) => {
  useCssLightDom(style)
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
  }

  return html`
    <host>
      <div class="link-preview" onmousedown=${onClickPreview}>
        <span class="link-preview-icon">
          ${config?.linkIcon()}
        </span>
        <span class="link-preview-display">${src}</span>
        <span onmousedown=${onClickEditButton}>
          ${config?.editButton()}
        </span>
        <span onmousedown=${onClickRemoveButton}>
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
