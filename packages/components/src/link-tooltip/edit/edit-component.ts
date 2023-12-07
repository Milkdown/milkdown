/* Copyright 2021, Milkdown by Mirone. */
import type { Component } from 'atomico'
import { html, useRef } from 'atomico'
import type { LinkTooltipConfig } from '../slices'

export interface LinkEditProps {
  config: LinkTooltipConfig
  src: string
  onConfirm: (href: string) => void
}

export const linkEditComponent: Component<LinkEditProps> = ({
  src,
  onConfirm,
  config,
}) => {
  const linkInput = useRef<HTMLInputElement>()

  const onConfirmEdit = () => {
    onConfirm?.(linkInput.current?.value ?? '')
  }

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter')
      onConfirm?.(linkInput.current?.value ?? '')
  }

  return html`
    <host>
      <input ref=${linkInput} onkeydown=${onKeydown} value=${src} />
      <span onclick=${onConfirmEdit}>
        ${config?.confirmButton()}
      </span>
    </host>
  `
}

linkEditComponent.props = {
  config: Object,
  src: String,
  onConfirm: Function,
}
