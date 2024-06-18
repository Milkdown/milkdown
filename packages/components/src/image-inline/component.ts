import { c, html, useRef, useState } from 'atomico'
import type { Component } from 'atomico'
import clsx from 'clsx'
import type { InlineImageConfig } from './config'

export interface Attrs {
  src: string
  alt: string
  title: string
}

export type InlineImageComponentProps = Attrs & {
  setAttr: <T extends keyof Attrs>(attr: T, value: Attrs[T]) => void
  selected: boolean
  config: InlineImageConfig
}

export const inlineImageComponent: Component<InlineImageComponentProps> = ({
  src = '',
  selected = false,
  alt,
  title,
  setAttr,
  config,
}) => {
  const linkInput = useRef<HTMLInputElement>()
  const [uuid] = useState(crypto.randomUUID())
  const [focusLinkInput, setFocusLinkInput] = useState(false)
  const [hidePlaceholder, setHidePlaceholder] = useState(src.length !== 0)
  const [currentLink, setCurrentLink] = useState(src)

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

  const onConfirmLinkInput = () => {
    setAttr?.('src', linkInput.current?.value ?? '')
  }

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter')
      onConfirmLinkInput()
  }

  const preventDrag = (e: Event) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const onClickUploader = (e: PointerEvent) => {
    e.stopPropagation()
    e.preventDefault()
  }

  return html`<host class=${clsx(selected && 'selected', !src && 'empty')}>
    ${!src
      ? html`<div class="empty-image-inline">
        <div class="image-icon">
          ${config?.imageIcon()}
        </div>
        <div class=${clsx('link-importer', focusLinkInput && 'focus')}>
          <input
            draggable="true"
            ref=${linkInput}
            ondragstart=${preventDrag}
            class="link-input-area"
            value=${currentLink}
            oninput=${onEditLink}
            onkeydown=${onKeydown}
            onfocus=${() => setFocusLinkInput(true)}
            onblur=${() => setFocusLinkInput(false)}
          />
          <div class=${clsx('placeholder', hidePlaceholder && 'hidden')}>
            <input class="hidden" id=${uuid} type="file" accept="image/*" onchange=${onUpload} />
            <label onpointerdown=${onClickUploader} class="uploader" for=${uuid}>
              ${config?.uploadButton()}
            </label>
            <span class="text" onclick=${() => linkInput.current?.focus()}>
              ${config?.uploadPlaceholderText}
            </span>
          </div>
        </div>
        <div
          class=${clsx('confirm', currentLink.length === 0 && 'hidden')}
          onclick=${() => onConfirmLinkInput()}
        >
          ${config?.confirmButton()}
        </div>
      </div>`
      : html`<img class="image-inline" src=${src} alt=${alt} title=${title} />`
    }
  </host>`
}

inlineImageComponent.props = {
  src: String,
  alt: String,
  title: String,
  selected: Boolean,
  setAttr: Function,
  config: Object,
}

export const InlineImageElement = c(inlineImageComponent)
