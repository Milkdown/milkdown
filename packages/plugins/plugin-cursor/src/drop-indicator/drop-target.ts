import type { Node } from '@milkdown/prose/model'
import type { EditorView } from '@milkdown/prose/view'

import { NodeSelection, type Selection } from '@milkdown/prose/state'

import type { DragEventHandler } from './types'

type Point = readonly [x: number, y: number]

type Line = readonly [x1: number, y1: number, x2: number, y2: number]

/**
 * @internal
 */
export type DropTarget = readonly [pos: number, line: Line]

function getTargetsByView(view: EditorView): DropTarget[] {
  type StackItem = [pos: number, node: Node]
  let stack: StackItem[] = [[-1, view.state.doc]]
  let targets: DropTarget[] = []

  while (stack.length > 0) {
    const [pos, node] = stack.pop()!
    if (pos >= 0) {
      let dom = view.nodeDOM(pos)
      if (dom && isHTMLElement(dom)) {
        let rect = dom.getBoundingClientRect()
        let { top, bottom, left: x1, right: x2 } = rect
        targets.push(
          [pos, [x1, top, x2, top]],
          [pos + node.nodeSize, [x1, bottom, x2, bottom]]
        )
      }
    }
    if (node.isBlock && !node.isTextblock) {
      let childPos = pos + 1
      for (let child of node.children) {
        stack.push([childPos, child])
        childPos += child.nodeSize
      }
    }
  }

  return targets
}

/**
 * @internal
 */
export type GetTarget = (
  point: Point,
  event: DragEvent
) => DropTarget | undefined

/**
 * @internal
 */
export function buildGetTarget(
  view: EditorView,
  onDrag: DragEventHandler
): GetTarget {
  let prevTargets: DropTarget[] = []
  let prevDoc: Node | undefined
  let prevRect: DOMRect | undefined

  const getTargets = (): DropTarget[] => {
    const rect = view.dom.getBoundingClientRect()
    const doc = view.state.doc

    if (
      prevTargets &&
      prevDoc &&
      prevRect &&
      rect.width === prevRect.width &&
      rect.height === prevRect.height &&
      rect.x === prevRect.x &&
      rect.y === prevRect.y &&
      prevDoc.eq(doc)
    ) {
      return prevTargets
    }

    prevRect = rect
    prevDoc = doc
    prevTargets = getTargetsByView(view)
    return prevTargets
  }

  const getTargetImpl: GetTarget = (point, event) => {
    if (!view.editable || view.isDestroyed) {
      return
    }

    const compare = (p1: DropTarget, p2: DropTarget): number => {
      const [pos1, line1] = p1
      const [pos2, line2] = p2
      const p1Distance = pointLineDistance(point, line1)
      const p2Distance = pointLineDistance(point, line2)

      return p1Distance - p2Distance || pos1 - pos2
    }

    let targets = getTargets()
    targets.sort(compare)

    // Only consider the first few targets for performance reasons.
    targets = targets.slice(0, 8)

    // Find the closest valid target.
    const target = targets.find(
      (target) => onDrag({ view, pos: target[0], event }) !== false
    )

    // If the dragging node is already at the target position, we ignore this
    // target. Notice that we don't pick the second better target here.
    if (target && isDraggingToItself(view, target[0])) {
      return undefined
    }

    return target
  }

  let prevPoint: Point | undefined
  let prevTarget: DropTarget | undefined

  const getTargetCached: GetTarget = (point, event) => {
    if (prevPoint && pointEqual(prevPoint, point)) {
      return prevTarget
    }

    prevPoint = point
    prevTarget = getTargetImpl(point, event)
    return prevTarget
  }

  return getTargetCached
}

function pointEqual(a: Point, b: Point) {
  return a[0] === b[0] && a[1] === b[1]
}

function pointPointDistance(a: Point, b: Point) {
  // Manhattan distance
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1])
}

function pointLineDistance(point: Point, line: Line) {
  // Notice that we are actually not calculating the distance between the point
  // and the line. Instead, we are calculating the distance between the point
  // and the two endpoints of the line.
  return Math.min(
    pointPointDistance(point, [line[0], line[1]]),
    pointPointDistance(point, [line[2], line[3]])
  )
}

/**
 * Whether the dragging node is being dragged to the same position. For example,
 * dragging a list node into a new position that is just below the list node, or
 * dragging a nested quoteblock into itself.
 */
function isDraggingToItself(view: EditorView, pos: number) {
  const dragging = view.dragging
  if (!dragging) return

  const { move } = dragging
  if (!move) return

  const selection = view.state.selection
  if (!isNodeSelection(selection)) return

  const { from, to } = selection
  return from <= pos && pos <= to
}

function isNodeSelection(selection: Selection) {
  return selection instanceof NodeSelection
}

function isHTMLElement(element: unknown) {
  return element instanceof HTMLElement
}
