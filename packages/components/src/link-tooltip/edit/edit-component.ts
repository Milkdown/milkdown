/* Copyright 2021, Milkdown by Mirone. */
import type { Component } from 'atomico'
import { html, useRef } from 'atomico'
import type { LinkTooltipConfig } from '../slices'

export interface LinkEditProps {
  config: LinkTooltipConfig
  src: string
  onConfirm: (href: string) => void
  onCancel: () => void
}

export const linkEditComponent: Component<LinkEditProps> = ({
  src,
  onConfirm,
  onCancel,
  config,
}) => {
  const linkInput = useRef<HTMLInputElement>()

  const onConfirmEdit = () => {
    onConfirm?.(linkInput.current?.value ?? '')
  }

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter')
      onConfirm?.(linkInput.current?.value ?? '')
    if (e.key === 'Escape')
      onCancel?.()
  }

  return html`
    <host>
      <div class="link-edit">
        <input
          class="input-area"
          placeholder=${config?.inputPlaceholder}
          ref=${linkInput}
          onkeydown=${onKeydown}
          value=${src}
        />
        <span class="button confirm" onclick=${onConfirmEdit}>
          ${config?.confirmButton()}
        </span>
      </div>
    </host>
  `
}

linkEditComponent.props = {
  config: Object,
  src: String,
  onConfirm: Function,
  onCancel: Function,
}
