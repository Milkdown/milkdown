import throttle from 'lodash.throttle'
import { computePosition, offset } from '@floating-ui/dom'
import { useEffect, useHost, useMemo } from 'atomico'
import { commandsCtx, editorViewCtx } from '@milkdown/core'
import { moveColCommand, moveRowCommand, selectColCommand, selectRowCommand } from '@milkdown/preset-gfm'
import type { Ctx } from '@milkdown/ctx'
import { computeColHandlePositionByIndex, computeRowHandlePositionByIndex, getRelatedDOM } from './utils'
import type { CellIndex, DragContext, Refs } from './types'

function prepareDndContext(refs: Refs): DragContext | undefined {
  const {
    dragPreviewRef,
    tableWrapperRef,
    contentWrapperRef,
    yLineHandleRef,
    xLineHandleRef,
    colHandleRef,
    rowHandleRef,
  } = refs

  const preview = dragPreviewRef.current
  if (!preview)
    return
  const wrapper = tableWrapperRef.current
  if (!wrapper)
    return
  const content = contentWrapperRef.current
  if (!content)
    return
  const contentRoot = content.querySelector('tbody')
  if (!contentRoot)
    return
  const previewRoot = preview.querySelector('tbody')
  if (!previewRoot)
    return
  const yHandle = yLineHandleRef.current
  if (!yHandle)
    return
  const xHandle = xLineHandleRef.current
  if (!xHandle)
    return
  const colHandle = colHandleRef.current
  if (!colHandle)
    return
  const rowHandle = rowHandleRef.current
  if (!rowHandle)
    return

  const context = {
    preview,
    wrapper,
    content,
    contentRoot,
    previewRoot,
    yHandle,
    xHandle,
    colHandle,
    rowHandle,
  }

  return context
}

function handleDrag(refs: Refs, event: DragEvent, ctx: Ctx | undefined, fn: (context: DragContext) => void) {
  const view = ctx?.get(editorViewCtx)
  if (!view?.editable)
    return

  event.stopPropagation()
  if (event.dataTransfer)
    event.dataTransfer.effectAllowed = 'move'

  const context = prepareDndContext(refs)

  if (!context)
    return

  // This is to avoid a chrome bug:
  // https://stackoverflow.com/questions/14203734/dragend-dragenter-and-dragleave-firing-off-immediately-when-i-drag
  requestAnimationFrame(() => {
    fn(context)
  })
}

export function createDragRowHandler(refs: Refs, ctx?: Ctx) {
  return (event: DragEvent) => {
    handleDrag(refs, event, ctx, ({
      preview,
      content,
      previewRoot,
      yHandle,
      xHandle,
      colHandle,
      rowHandle,
    }) => {
      const { hoverIndex, dragInfo } = refs
      xHandle.dataset.displayType = 'indicator'
      yHandle.dataset.show = 'false'
      colHandle.dataset.show = 'false'
      rowHandle.querySelector('.button-group')?.setAttribute('data-show', 'false')

      const [rowIndex] = hoverIndex.current!

      dragInfo.current = {
        startCoords: [event.clientX, event.clientY],
        startIndex: rowIndex,
        endIndex: rowIndex,
        type: 'row',
      }
      preview.dataset.direction = 'vertical'

      const rows = content.querySelectorAll('tr')
      while (previewRoot.firstChild)
        previewRoot.removeChild(previewRoot.firstChild)

      const row = rows[rowIndex]
      if (!row)
        return

      previewRoot.appendChild(row.cloneNode(true))
      const height = row.getBoundingClientRect().height

      const { width } = content.querySelector('tbody')!.getBoundingClientRect()
      Object.assign(preview.style, {
        width: `${width}px`,
        height: `${height}px`,
      })

      preview.dataset.show = 'true'
    })
  }
}

export function createDragColHandler(refs: Refs, ctx?: Ctx) {
  return (event: DragEvent) => {
    handleDrag(refs, event, ctx, ({
      preview,
      content,
      previewRoot,
      yHandle,
      xHandle,
      colHandle,
      rowHandle,
    }) => {
      const { hoverIndex, dragInfo } = refs
      xHandle.dataset.show = 'false'
      yHandle.dataset.displayType = 'indicator'
      rowHandle.dataset.show = 'false'
      colHandle.querySelector('.button-group')?.setAttribute('data-show', 'false')

      const [_, colIndex] = hoverIndex.current!

      dragInfo.current = {
        startCoords: [event.clientX, event.clientY],
        startIndex: colIndex,
        endIndex: colIndex,
        type: 'col',
      }
      preview.dataset.direction = 'horizontal'

      const rows = content.querySelectorAll('tr')
      while (previewRoot.firstChild)
        previewRoot.removeChild(previewRoot.firstChild)

      let width: number | undefined

      Array.from(rows).forEach((row) => {
        const col = row.children[colIndex]
        if (!col)
          return

        if (width === undefined)
          width = col.getBoundingClientRect().width

        const tr = col.parentElement!.cloneNode(false)
        const clone = col.cloneNode(true)
        tr.appendChild(clone)
        previewRoot.appendChild(tr)
      })

      const { height } = content.querySelector('tbody')!.getBoundingClientRect()
      Object.assign(preview.style, {
        width: `${width}px`,
        height: `${height}px`,
      })

      preview.dataset.show = 'true'
    })
  }
}

export function createDragOverHandler(refs: Refs): (e: DragEvent) => void {
  return throttle((e: DragEvent) => {
    const context = prepareDndContext(refs)
    if (!context)
      return
    const {
      preview,
      content,
      contentRoot,
      xHandle,
      yHandle,
    } = context
    const {
      dragInfo,
      hoverIndex,
    } = refs

    if (preview.dataset.show === 'false')
      return
    const dom = getRelatedDOM(refs.contentWrapperRef, hoverIndex.current!)
    if (!dom)
      return
    const firstRow = contentRoot.querySelector('tr')
    if (!firstRow)
      return
    const info = dragInfo.current
    if (!info)
      return

    const wrapperOffsetTop = (contentRoot.offsetParent as HTMLElement).offsetTop
    const wrapperOffsetLeft = (contentRoot.offsetParent as HTMLElement).offsetLeft

    if (info.type === 'col') {
      const width = dom.col.getBoundingClientRect().width
      const { left, width: fullWidth } = contentRoot.getBoundingClientRect()
      const leftGap = wrapperOffsetLeft - left
      const previewLeft = e.clientX + leftGap - width / 2
      const previewRight = e.clientX + leftGap + width / 2

      const [startX] = info.startCoords
      const direction = startX < e.clientX ? 'right' : 'left'

      preview.style.top = `${wrapperOffsetTop}px`
      const previewLeftOffset = previewLeft < left + leftGap - 20
        ? left + leftGap - 20
        : previewLeft > left + fullWidth + leftGap - width + 20
          ? left + fullWidth + leftGap - width + 20
          : previewLeft

      preview.style.left = `${previewLeftOffset}px`

      const children = Array.from(firstRow.children)
      const col = children.find((col, index) => {
        const boundary = col.getBoundingClientRect()
        let boundaryLeft = boundary.left + wrapperOffsetLeft - left
        let boundaryRight = boundary.right + wrapperOffsetLeft - left
        if (direction === 'right') {
          boundaryLeft = boundaryLeft + boundary.width / 2
          boundaryRight = boundaryRight + boundary.width / 2
          if (boundaryLeft <= previewRight && boundaryRight >= previewRight)
            return true
          if (index === firstRow.children.length - 1 && previewRight > boundaryRight)
            return true
        }
        else {
          boundaryLeft = boundaryLeft - boundary.width / 2
          boundaryRight = boundaryRight - boundary.width / 2
          if (boundaryLeft <= previewLeft && boundaryRight >= previewLeft)
            return true
          if (index === 0 && previewLeft < boundaryLeft)
            return true
        }

        return false
      })
      if (col) {
        const yHandleWidth = yHandle.getBoundingClientRect().width
        const contentBoundary = content.getBoundingClientRect()
        const index = children.indexOf(col)
        info.endIndex = index

        computePosition(col, yHandle, {
          placement: direction === 'left' ? 'left' : 'right',
          middleware: [offset(direction === 'left' ? -1 * yHandleWidth : 0)],
        })
          .then(({ x }) => {
            yHandle.dataset.show = 'true'
            Object.assign(yHandle.style, {
              height: `${contentBoundary.height}px`,
              left: `${x}px`,
              top: `${wrapperOffsetTop}px`,
            })
          })
      }
    }
    else if (info.type === 'row') {
      const height = dom.row.getBoundingClientRect().height
      const { top, height: fullHeight } = contentRoot.getBoundingClientRect()

      const topGap = wrapperOffsetTop - top
      const previewTop = e.clientY + topGap - height / 2
      const previewBottom = e.clientY + topGap + height / 2

      const [_, startY] = info.startCoords
      const direction = startY < e.clientY ? 'down' : 'up'

      const previewTopOffset = previewTop < top + topGap - 20
        ? top + topGap - 20
        : previewTop > top + fullHeight + topGap - height + 20
          ? top + fullHeight + topGap - height + 20
          : previewTop

      preview.style.top = `${previewTopOffset}px`
      preview.style.left = `${wrapperOffsetLeft}px`

      const rows = Array.from(contentRoot.querySelectorAll('tr'))
      const row = rows.find((row, index) => {
        const boundary = row.getBoundingClientRect()
        let boundaryTop = boundary.top + wrapperOffsetTop - top
        let boundaryBottom = boundary.bottom + wrapperOffsetTop - top
        if (direction === 'down') {
          boundaryTop = boundaryTop + boundary.height / 2
          boundaryBottom = boundaryBottom + boundary.height / 2
          if (boundaryTop <= previewBottom && boundaryBottom >= previewBottom)
            return true
          if (index === rows.length - 1 && previewBottom > boundaryBottom)
            return true
        }
        else {
          boundaryTop = boundaryTop - boundary.height / 2
          boundaryBottom = boundaryBottom - boundary.height / 2
          if (boundaryTop <= previewTop && boundaryBottom >= previewTop)
            return true
          if (index === 0 && previewTop < boundaryTop)
            return true
        }
        return false
      })
      if (row) {
        const xHandleHeight = xHandle.getBoundingClientRect().height
        const contentBoundary = content.getBoundingClientRect()
        const index = rows.indexOf(row)
        info.endIndex = index

        computePosition(row, xHandle, {
          placement: direction === 'up' ? 'top' : 'bottom',
          middleware: [offset(direction === 'up' ? -1 * xHandleHeight : 0)],
        })
          .then(({ y }) => {
            xHandle.dataset.show = 'true'
            Object.assign(xHandle.style, {
              width: `${contentBoundary.width}px`,
              top: `${y}px`,
            })
          })
      }
    }
  }, 20)
}

export function useDragHandlers(
  refs: Refs,
  ctx?: Ctx,
  getPos?: () => number | undefined,
) {
  const {
    dragPreviewRef,
    yLineHandleRef,
    xLineHandleRef,
    dragInfo,
  } = refs
  const host = useHost()
  const root = useMemo(() => host.current.getRootNode() as HTMLElement, [host])

  const dragRow = useMemo(() => createDragRowHandler(refs, ctx), [refs])
  const dragCol = useMemo(() => createDragColHandler(refs, ctx), [refs])

  useEffect(() => {
    const onDragEnd = () => {
      const preview = dragPreviewRef.current
      if (!preview)
        return

      if (preview.dataset.show === 'false')
        return

      const previewRoot = preview?.querySelector('tbody')

      while (previewRoot?.firstChild)
        previewRoot?.removeChild(previewRoot.firstChild)

      if (preview)
        preview.dataset.show = 'false'
    }

    const onDrop = () => {
      const preview = dragPreviewRef.current
      if (!preview)
        return
      const yHandle = yLineHandleRef.current
      if (!yHandle)
        return
      const xHandle = xLineHandleRef.current
      if (!xHandle)
        return
      const info = dragInfo.current
      if (!info)
        return
      if (!ctx)
        return
      if (preview.dataset.show === 'false')
        return
      const colHandle = refs.colHandleRef.current
      if (!colHandle)
        return
      const rowHandle = refs.rowHandleRef.current
      if (!rowHandle)
        return

      yHandle.dataset.show = 'false'
      xHandle.dataset.show = 'false'

      if (info.startIndex === info.endIndex)
        return

      const commands = ctx.get(commandsCtx)
      const payload = {
        from: info.startIndex,
        to: info.endIndex,
        pos: (getPos?.() ?? 0) + 1,
      }
      if (info.type === 'col') {
        commands.call(selectColCommand.key, {
          pos: payload.pos,
          index: info.startIndex,
        })
        commands.call(moveColCommand.key, payload)
        const index: CellIndex = [0, info.endIndex]
        computeColHandlePositionByIndex({
          refs,
          index,
        })
      }
      else {
        commands.call(selectRowCommand.key, {
          pos: payload.pos,
          index: info.startIndex,
        })
        commands.call(moveRowCommand.key, payload)
        const index: CellIndex = [info.endIndex, 0]
        computeRowHandlePositionByIndex({
          refs,
          index,
        })
      }

      requestAnimationFrame(() => {
        ctx.get(editorViewCtx).focus()
      })
    }
    const onDragOver = createDragOverHandler(refs)

    root.addEventListener('dragover', onDragOver)
    root.addEventListener('dragend', onDragEnd)
    root.addEventListener('drop', onDrop)
    return () => {
      root.removeEventListener('dragover', onDragOver)
      root.removeEventListener('dragend', onDragEnd)
      root.removeEventListener('drop', onDrop)
    }
  }, [])

  return {
    dragRow,
    dragCol,
  }
}
