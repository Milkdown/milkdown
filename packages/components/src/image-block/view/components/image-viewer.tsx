import { defineComponent, ref, h, Fragment } from 'vue'

import type { MilkdownImageBlockProps } from './image-block'

import { Icon } from '../../../__internal__/components/icon'
import { keepAlive } from '../../../__internal__/keep-alive'
import { IMAGE_DATA_TYPE } from '../../schema'

keepAlive(h, Fragment)

export const ImageViewer = defineComponent<MilkdownImageBlockProps>({
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
  setup({ src, caption, ratio, readonly, setAttr, config }) {
    const imageRef = ref<HTMLImageElement>()
    const resizeHandle = ref<HTMLDivElement>()
    const showCaption = ref(Boolean(caption.value?.length))
    const timer = ref(0)

    const onImageLoad = () => {
      const image = imageRef.value
      if (!image) return
      const host = image.closest('.milkdown-image-block')
      if (!host) return

      let maxWidth = host.getBoundingClientRect().width
      if (!maxWidth) return

      if (config.maxWidth && config.maxWidth < maxWidth)
        maxWidth = config.maxWidth

      const height = image.naturalHeight
      const width = image.naturalWidth
      let transformedHeight =
        width < maxWidth ? height : maxWidth * (height / width)

      if (config.maxHeight && transformedHeight > config.maxHeight)
        transformedHeight = config.maxHeight

      const h = (transformedHeight * (ratio.value ?? 1)).toFixed(2)
      image.dataset.origin = transformedHeight.toFixed(2)
      image.dataset.height = h
      image.style.height = `${h}px`

      if (config.maxWidth) image.style.maxWidth = `${config.maxWidth}px`
    }

    const onToggleCaption = (e: PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (readonly.value) return
      showCaption.value = !showCaption.value
    }

    const onInputCaption = (e: Event) => {
      const target = e.target as HTMLInputElement
      const value = target.value
      if (timer.value) window.clearTimeout(timer.value)

      timer.value = window.setTimeout(() => {
        setAttr('caption', value)
      }, 1000)
    }

    const onBlurCaption = (e: Event) => {
      const target = e.target as HTMLInputElement
      const value = target.value
      if (timer.value) {
        window.clearTimeout(timer.value)
        timer.value = 0
      }

      setAttr('caption', value)
    }

    const onResizeHandlePointerMove = (e: PointerEvent) => {
      e.preventDefault()
      const image = imageRef.value
      if (!image) return
      const top = image.getBoundingClientRect().top
      let height = e.clientY - top
      if (height < 100) height = 100
      if (config.maxHeight && height > config.maxHeight)
        height = config.maxHeight
      const h = Number(height).toFixed(2)
      image.dataset.height = h
      image.style.height = `${h}px`
    }

    const onResizeHandlePointerUp = () => {
      window.removeEventListener('pointermove', onResizeHandlePointerMove)
      window.removeEventListener('pointerup', onResizeHandlePointerUp)

      const image = imageRef.value
      if (!image) return

      const originHeight = Number(image.dataset.origin)
      const currentHeight = Number(image.dataset.height)
      const ratio = Number.parseFloat(
        Number(currentHeight / originHeight).toFixed(2)
      )
      if (Number.isNaN(ratio)) return

      setAttr('ratio', ratio)
    }

    const onResizeHandlePointerDown = (e: PointerEvent) => {
      if (readonly.value) return
      e.preventDefault()
      e.stopPropagation()
      window.addEventListener('pointermove', onResizeHandlePointerMove)
      window.addEventListener('pointerup', onResizeHandlePointerUp)
    }

    return () => {
      return (
        <>
          <div class="image-wrapper">
            <div class="operation">
              <div class="operation-item" onPointerdown={onToggleCaption}>
                <Icon icon={config.captionIcon} />
              </div>
            </div>
            <img
              ref={imageRef}
              data-type={IMAGE_DATA_TYPE}
              onLoad={onImageLoad}
              src={src.value}
              alt={caption.value}
              onError={(e) =>
                Promise.resolve(config.onImageLoadError?.(e)).catch(() => {})
              }
            />
            <div
              ref={resizeHandle}
              class="image-resize-handle"
              onPointerdown={onResizeHandlePointerDown}
            />
          </div>
          {showCaption.value && (
            <input
              draggable="true"
              onDragstart={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              class="caption-input"
              placeholder={config?.captionPlaceholderText}
              onInput={onInputCaption}
              onBlur={onBlurCaption}
              value={caption.value}
            />
          )}
        </>
      )
    }
  },
})
