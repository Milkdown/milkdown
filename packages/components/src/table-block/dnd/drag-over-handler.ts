import { computePosition, offset } from '@floating-ui/dom'
import { throttle } from 'lodash-es'

import type { Refs } from '../view/types'

import { getRelatedDOM } from '../view/utils'
import { getDragOverColumn, getDragOverRow } from './calc-drag-over'
import { prepareDndContext } from './prepare-dnd-context'

export function createDragOverHandler(refs: Refs): (e: DragEvent) => void {
  return throttle((e: DragEvent) => {
    const context = prepareDndContext(refs)
    if (!context) return
    const { preview, content, contentRoot, xHandle, yHandle } = context
    const { dragInfo, hoverIndex } = refs

    if (preview.dataset.show === 'false') return
    const dom = getRelatedDOM(refs.contentWrapperRef, hoverIndex.value!)
    if (!dom) return
    const firstRow = contentRoot.querySelector('tr')
    if (!firstRow) return
    const info = dragInfo.value
    if (!info) return

    if (!contentRoot.offsetParent) return

    const wrapperOffsetTop = (contentRoot.offsetParent as HTMLElement).offsetTop
    const wrapperOffsetLeft = (contentRoot.offsetParent as HTMLElement)
      .offsetLeft

    if (info.type === 'col') {
      const width = dom.col.getBoundingClientRect().width
      const { left, width: fullWidth } = contentRoot.getBoundingClientRect()
      const leftGap = wrapperOffsetLeft - left
      const previewLeft = e.clientX + leftGap - width / 2

      const [startX] = info.startCoords
      const direction = startX < e.clientX ? 'right' : 'left'

      preview.style.top = `${wrapperOffsetTop}px`
      const previewLeftOffset =
        previewLeft < left + leftGap - 20
          ? left + leftGap - 20
          : previewLeft > left + fullWidth + leftGap - width + 20
            ? left + fullWidth + leftGap - width + 20
            : previewLeft

      preview.style.left = `${previewLeftOffset}px`

      const dragOverColumn = getDragOverColumn(contentRoot, e.clientX)
      if (dragOverColumn) {
        const [col, index] = dragOverColumn
        const yHandleWidth = yHandle.getBoundingClientRect().width
        const contentBoundary = content.getBoundingClientRect()
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
          .catch(console.error)
      }
    } else if (info.type === 'row') {
      const height = dom.row.getBoundingClientRect().height
      const { top, height: fullHeight } = contentRoot.getBoundingClientRect()

      const topGap = wrapperOffsetTop - top
      const previewTop = e.clientY + topGap - height / 2

      const [_, startY] = info.startCoords
      const direction = startY < e.clientY ? 'down' : 'up'

      const previewTopOffset =
        previewTop < top + topGap - 20
          ? top + topGap - 20
          : previewTop > top + fullHeight + topGap - height + 20
            ? top + fullHeight + topGap - height + 20
            : previewTop

      preview.style.top = `${previewTopOffset}px`
      preview.style.left = `${wrapperOffsetLeft}px`

      const dragOverRow = getDragOverRow(contentRoot, e.clientY)
      if (dragOverRow) {
        const [row, index] = dragOverRow
        const xHandleHeight = xHandle.getBoundingClientRect().height
        const contentBoundary = content.getBoundingClientRect()
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
          .catch(console.error)
      }
    }
  }, 20)
}
