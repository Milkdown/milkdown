import type { Component } from 'atomico'
import { c, html, useEffect, useRef, useState } from 'atomico'
import clsx from 'clsx'
import type { ImageBlockConfig } from '../config'
import { IMAGE_DATA_TYPE } from '../schema'
import { useBlockEffect } from './event'

export interface Attrs {
  src: string
  caption: string
  ratio: number
}

export type ImageComponentProps = Attrs & {
  config: ImageBlockConfig
  selected: boolean
  readonly: boolean
  setAttr: <T extends keyof Attrs>(attr: T, value: Attrs[T]) => void
}

let timer: number = 0

export const imageComponent: Component<ImageComponentProps> = ({
  src = '',
  caption = '',
  ratio = 1,
  selected = false,
  readonly = false,
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
    if (timer)
      window.clearTimeout(timer)

    timer = window.setTimeout(() => {
      setAttr?.('caption', value)
    }, 1000)
  }

  const onBlurCaption = (e: InputEvent) => {
    const target = e.target as HTMLInputElement
    const value = target.value
    if (timer) {
      window.clearTimeout(timer)
      timer = 0
    }

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

  const onToggleCaption = (e: Event) => {
    e.preventDefault()
    e.stopPropagation()
    if (readonly)
      return
    setShowCaption(x => !x)
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

  return html`<host class=${clsx(selected && 'selected')}>
    <div class=${clsx('image-edit', src.length > 0 && 'hidden')}>
      <div class="image-icon">
        ${config?.imageIcon()}
      </div>
      <div class=${clsx('link-importer', focusLinkInput && 'focus')}>
        <input
          ref=${linkInput}
          draggable="true"
          ondragstart=${preventDrag}
          disabled=${readonly}
          class="link-input-area"
          value=${currentLink}
          oninput=${onEditLink}
          onkeydown=${onKeydown}
          onfocus=${() => setFocusLinkInput(true)}
          onblur=${() => setFocusLinkInput(false)}
        />
        <div class=${clsx('placeholder', hidePlaceholder && 'hidden')}>
          <input disabled=${readonly} class="hidden" id=${uuid} type="file" accept="image/*" onchange=${onUpload} />
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
    </div>
    <div class=${clsx('image-wrapper', src.length === 0 && 'hidden')}>
      <div class="operation">
        <div class="operation-item" onpointerdown=${onToggleCaption}>${config?.captionIcon()}</div>
      </div>
      <img ref=${image} data-type=${IMAGE_DATA_TYPE} src=${src} alt=${caption} ratio=${ratio} />
      <div ref=${resizeHandle} class="image-resize-handle"></div>
    </div>
    <input
      draggable="true"
      ondragstart=${preventDrag}
      class=${clsx('caption-input', !showCaption && 'hidden')}
      placeholder=${config?.captionPlaceholderText}
      oninput=${onInput}
      onblur=${onBlurCaption}
      value=${caption}
    />
  </host>`
}

imageComponent.props = {
  src: String,
  caption: String,
  ratio: Number,
  selected: Boolean,
  readonly: Boolean,
  setAttr: Function,
  config: Object,
}

export const ImageElement = c(imageComponent)
