import type { Line } from './types'

export function drawIndicator(
  element: HTMLElement,
  lineWidth: number,
  line: Line
) {
  const {
    p1: { x: x1, y: y1 },
    p2: { x: x2, y: y2 },
  } = line
  const horizontal = y1 === y2

  let width: number
  let height: number
  let top: number = y1
  let left: number = x1

  if (horizontal) {
    width = x2 - x1
    height = lineWidth
    top -= lineWidth / 2
  } else {
    width = lineWidth
    height = y2 - y1
    left -= lineWidth / 2
  }

  top = Math.round(top)
  left = Math.round(left)

  Object.assign(element.style, {
    position: 'fixed',
    pointerEvents: 'none',
    width: `${width}px`,
    height: `${height}px`,
    transform: `translate(${left}px, ${top}px)`,
    left: '0px',
    top: '0px',
  })
}
