import { type Ref, useEffect, useHost, useMemo } from 'atomico'

interface Options {
  image: Ref<HTMLImageElement>
  resizeHandle: Ref<HTMLDivElement>
  ratio: number
  setRatio: (ratio: number) => void
  src: string
}

export function useBlockEffect({
  image,
  resizeHandle,
  ratio,
  setRatio,
  src,
}: Options) {
  const host = useHost()
  const root = useMemo(() => host.current.getRootNode() as HTMLElement, [host])

  useEffect(() => {
    const imageRef = image.current
    if (!imageRef)
      return

    delete imageRef.dataset.origin
    delete imageRef.dataset.height
    imageRef.style.height = ''
  }, [src])

  useEffect(() => {
    const resizeHandleRef = resizeHandle.current
    const imageRef = image.current
    if (!resizeHandleRef || !imageRef)
      return
    const onMove = (e: PointerEvent) => {
      e.preventDefault()
      const top = imageRef.getBoundingClientRect().top
      const height = e.clientY - top
      const h = Number(height < 100 ? 100 : height).toFixed(2)
      imageRef.dataset.height = h
      imageRef.style.height = `${h}px`
    }
    const pointerUp = () => {
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerup', pointerUp)
      const originHeight = Number(imageRef.dataset.origin)
      const currentHeight = Number(imageRef.dataset.height)
      const ratio = Number.parseFloat(Number(currentHeight / originHeight).toFixed(2))
      if (Number.isNaN(ratio))
        return

      setRatio(ratio)
    }

    const pointerDown = (e: PointerEvent) => {
      e.preventDefault()
      root.addEventListener('pointermove', onMove)
      root.addEventListener('pointerup', pointerUp)
    }

    const onLoad = (e: Event) => {
      const maxWidth = host.current.getBoundingClientRect().width
      if (!maxWidth)
        return

      const target = e.target as HTMLImageElement
      const height = target.height
      const width = target.width
      const transformedHeight = width < maxWidth ? height : maxWidth * (height / width)
      const h = (transformedHeight * ratio).toFixed(2)
      imageRef.dataset.origin = transformedHeight.toFixed(2)
      imageRef.dataset.height = h
      imageRef.style.height = `${h}px`
    }

    imageRef.addEventListener('load', onLoad)
    resizeHandleRef.addEventListener('pointerdown', pointerDown)
    return () => {
      imageRef.removeEventListener('load', onLoad)
      resizeHandleRef.removeEventListener('pointerdown', pointerDown)
    }
  }, [])
}
