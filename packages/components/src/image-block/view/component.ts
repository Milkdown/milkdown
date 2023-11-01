/* Copyright 2021, Milkdown by Mirone. */
import type { Component } from 'atomico'
import { html, useEffect, useRef, useState } from 'atomico'
import { useCssLightDom } from '@atomico/hooks/use-css-light-dom'
import clsx from 'clsx'
import type { ImageBlockConfig } from '../config'
import { useBlockEffect } from './event'
import { style } from './style'

export interface Attrs {
  src: string
  caption: string
  ratio: number
}

export type ImageComponentProps = Attrs & {
  config: ImageBlockConfig
  selected: boolean
  setAttr: <T extends keyof Attrs>(attr: T, value: Attrs[T]) => void
}

export const imageComponent: Component<ImageComponentProps> = ({
  src = '',
  caption = '',
  ratio = 1,
  selected = false,
  setAttr,
  config,
}) => {
  const image = useRef<HTMLImageElement>()
  const resizeHandle = useRef<HTMLDivElement>()
  const linkInput = useRef<HTMLInputElement>()
  const [showCaption, setShowCaption] = useState(caption.length > 0)
  const [hidePlaceholder, setHidePlaceholder] = useState(src.length !== 0)
  const [uuid] = useState(crypto.randomUUID())
  const [focusLinkInput, setFocusLinkInput] = useState(false)
  const [currentLink, setCurrentLink] = useState(src)
  useCssLightDom(style)

  useBlockEffect({
    image,
    resizeHandle,
    ratio,
    setRatio: r => setAttr?.('ratio', r),
    src,
  })

  useEffect(() => {
    if (selected)
      return

    setShowCaption(caption.length > 0)
  }, [selected])

  const onInput = (e: InputEvent) => {
    const target = e.target as HTMLInputElement
    const value = target.value
    setAttr?.('caption', value)
  }

  const onEditLink = (e: InputEvent) => {
    const target = e.target as HTMLInputElement
    const value = target.value
    setHidePlaceholder(value.length !== 0)
    setCurrentLink(value)
  }

  const onUpload = async (e: InputEvent) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file)
      return

    const url = await config?.onUpload(file)
    if (!url)
      return

    setAttr?.('src', url)
    setHidePlaceholder(true)
  }

  const onToggleCaption = () => {
    setShowCaption(x => !x)
  }

  const onConfirmLinkInput = () => {
    setAttr?.('src', linkInput.current?.value ?? '')
  }

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter')
      onConfirmLinkInput()
  }

  return html`<host class=${clsx(selected && 'selected')}>
    <div class=${clsx('image-edit', src.length > 0 && 'hidden')}>
      <div class="image-icon">
        ${config?.imageIcon()}
      </div>
      <div class=${clsx('link-importer', focusLinkInput && 'focus')}>
        <input
          ref=${linkInput}
          class="link-input-area"
          value=${currentLink}
          oninput=${onEditLink}
          onkeydown=${onKeydown}
          onfocus=${() => setFocusLinkInput(true)}
          onblur=${() => setFocusLinkInput(false)}
        />
        <div class=${clsx('placeholder', hidePlaceholder && 'hidden')}>
          <input class="hidden" id=${uuid} type="file" accept="image/*" onchange=${onUpload} />
          <label class="uploader" for=${uuid}>
            ${config?.uploadButton()}
          </label>
          <span class="text" onclick=${() => linkInput.current?.focus()}>
            ${config?.uploadPlaceholderText}
          </span>
        </div>
      </div>
      <button
        class=${clsx('confirm', currentLink.length === 0 && 'hidden')}
        onclick=${() => onConfirmLinkInput()}
      >
        ${config?.confirmButton()}
      </button>
    </div>
    <div class=${clsx('image-wrapper', src.length === 0 && 'hidden')}>
      <div class="operation">
        <div class="operation-item" onmousedown=${onToggleCaption}>${config?.captionIcon()}</div>
      </div>
      <img ref=${image} src=${src} alt=${caption} />
      <div ref=${resizeHandle} class="image-resize-handle"></div>
    </div>
    <input
      class=${clsx('caption-input', !showCaption && 'hidden')}
      placeholder=${config?.captionPlaceholderText}
      oninput=${onInput}
      value=${caption}
    />
  </host>`
}

imageComponent.props = {
  src: String,
  caption: String,
  ratio: Number,
  selected: Boolean,
  setAttr: Function,
  config: Object,
}
