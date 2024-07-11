import { computePosition, offset } from '@floating-ui/dom'
import type { EditorView } from '@milkdown/prose/view'
import throttle from 'lodash.throttle'
import { useMemo } from 'atomico'
import type { Refs } from './types'
import {
  computeColHandlePositionByIndex,
  computeRowHandlePositionByIndex,
  findPointerIndex,
  getRelatedDOM,
} from './utils'

export function createPointerMoveHandler(refs: Refs, view?: EditorView): (e: PointerEvent) => void {
  return throttle((e: PointerEvent) => {
    if (!view?.editable)
      return
    const {
      contentWrapperRef,
      yLineHandleRef,
      xLineHandleRef,
      colHandleRef,
      rowHandleRef,
      hoverIndex,
      lineHoverIndex,
    } = refs
    const yHandle = yLineHandleRef.current
    if (!yHandle)
      return
    const xHandle = xLineHandleRef.current
    if (!xHandle)
      return
    const content = contentWrapperRef.current
    if (!content)
      return
    const rowHandle = rowHandleRef.current
    if (!rowHandle)
      return
    const colHandle = colHandleRef.current
    if (!colHandle)
      return

    const index = findPointerIndex(e, view)
    if (!index)
      return

    const dom = getRelatedDOM(contentWrapperRef, index)
    if (!dom)
      return

    const [rowIndex, colIndex] = index
    const boundary = dom.col.getBoundingClientRect()
    const closeToBoundaryLeft = Math.abs(e.clientX - boundary.left) < 8
    const closeToBoundaryRight = Math.abs(boundary.right - e.clientX) < 8
    const closeToBoundaryTop = Math.abs(e.clientY - boundary.top) < 8
    const closeToBoundaryBottom = Math.abs(boundary.bottom - e.clientY) < 8

    const closeToBoundary = closeToBoundaryLeft || closeToBoundaryRight || closeToBoundaryTop || closeToBoundaryBottom

    const rowButtonGroup = rowHandle.querySelector<HTMLElement>('.button-group')
    const colButtonGroup = colHandle.querySelector<HTMLElement>('.button-group')
    if (rowButtonGroup)
      rowButtonGroup.dataset.show = 'false'
    if (colButtonGroup)
      colButtonGroup.dataset.show = 'false'

    if (closeToBoundary) {
      const contentBoundary = content.getBoundingClientRect()
      rowHandle.dataset.show = 'false'
      colHandle.dataset.show = 'false'
      xHandle.dataset.displayType = 'tool'
      yHandle.dataset.displayType = 'tool'

      const yHandleWidth = yHandle.getBoundingClientRect().width
      const xHandleHeight = xHandle.getBoundingClientRect().height

      // display vertical line handle
      if (closeToBoundaryLeft || closeToBoundaryRight) {
        lineHoverIndex.current![1] = closeToBoundaryLeft ? colIndex : colIndex + 1
        computePosition(dom.col, yHandle, {
          placement: closeToBoundaryLeft ? 'left' : 'right',
          middleware: [offset(closeToBoundaryLeft ? -1 * yHandleWidth : 0)],
        })
          .then(({ x }) => {
            yHandle.dataset.show = 'true'
            Object.assign(yHandle.style, {
              height: `${contentBoundary.height}px`,
              left: `${x}px`,
            })
          })
      }
      else {
        yHandle.dataset.show = 'false'
      }

      // display horizontal line handle
      // won't display if the row is the header row
      if (index[0] !== 0 && (closeToBoundaryTop || closeToBoundaryBottom)) {
        lineHoverIndex.current![0] = closeToBoundaryTop ? rowIndex : rowIndex + 1
        computePosition(dom.row, xHandle, {
          placement: closeToBoundaryTop ? 'top' : 'bottom',
          middleware: [offset(closeToBoundaryTop ? -1 * xHandleHeight : 0)],
        })
          .then(({ y }) => {
            xHandle.dataset.show = 'true'
            Object.assign(xHandle.style, {
              width: `${contentBoundary.width}px`,
              top: `${y}px`,
            })
          })
      }
      else {
        xHandle.dataset.show = 'false'
      }

      return
    }

    lineHoverIndex.current = [-1, -1]

    yHandle.dataset.show = 'false'
    xHandle.dataset.show = 'false'
    rowHandle.dataset.show = 'true'
    colHandle.dataset.show = 'true'

    computeRowHandlePositionByIndex({
      refs,
      index,
    })
    computeColHandlePositionByIndex({
      refs,
      index,
    })
    hoverIndex.current = index
  }, 20)
}

export function createPointerLeaveHandler(refs: Refs): () => void {
  return () => {
    const {
      rowHandleRef,
      colHandleRef,
      yLineHandleRef,
      xLineHandleRef,
    } = refs
    setTimeout(() => {
      const rowHandle = rowHandleRef.current
      if (!rowHandle)
        return
      const colHandle = colHandleRef.current
      if (!colHandle)
        return
      const yHandle = yLineHandleRef.current
      if (!yHandle)
        return
      const xHandle = xLineHandleRef.current
      if (!xHandle)
        return

      rowHandle.dataset.show = 'false'
      colHandle.dataset.show = 'false'
      yHandle.dataset.show = 'false'
      xHandle.dataset.show = 'false'
    }, 200)
  }
}

export function usePointerHandlers(refs: Refs, view?: EditorView) {
  const pointerMove = useMemo(() => createPointerMoveHandler(refs, view), [])
  const pointerLeave = useMemo(() => createPointerLeaveHandler(refs), [])

  return {
    pointerMove,
    pointerLeave,
  }
}
