/* Copyright 2021, Milkdown by Mirone. */
import type { Component } from 'atomico'
import { html, useRef } from 'atomico'
import { useCssLightDom } from '@atomico/hooks/use-css-light-dom'
import type { LinkTooltipConfig } from '../slices'
import { style } from './style'

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
  useCssLightDom(style)
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
      <div class="link-edit">
        <input class="input-area" ref=${linkInput} onkeydown=${onKeydown} value=${src} />
        <span class="confirm" onclick=${onConfirmEdit}>
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
}
