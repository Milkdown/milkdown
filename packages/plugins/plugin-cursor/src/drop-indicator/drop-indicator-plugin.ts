import type { ResolvedPos } from '@milkdown/prose/model'
import type { EditorView } from '@milkdown/prose/view'

import {
  NodeSelection,
  Plugin,
  PluginKey,
  TextSelection,
  type PluginView,
} from '@milkdown/prose/state'

import type { DragEventHandler, ShowHandler, ViewDragging } from './types'

import { buildGetTarget, type GetTarget } from './drop-target'

/**
 * @internal
 */
interface DropIndicatorPluginOptions {
  onDrag: DragEventHandler
  onShow: ShowHandler
  onHide: VoidFunction
}

/**
 * @internal
 */
export function createDropIndicatorPlugin(
  options: DropIndicatorPluginOptions
): Plugin {
  let getTarget: GetTarget | undefined

  return new Plugin({
    key: new PluginKey('MILKDOWN_DROP_INDICATOR'),
    view: (view) => {
      getTarget = buildGetTarget(view, options.onDrag)
      return createDropIndicatorView(view, getTarget, options)
    },
    props: {
      handleDrop(view, event, slice, move): boolean {
        if (!getTarget) return false

        const target = getTarget([event.clientX, event.clientY], event)

        if (!target) return false

        event.preventDefault()
        let insertPos = target[0]

        let tr = view.state.tr
        if (move) {
          let { node } = (view.dragging as ViewDragging | null) || {}
          if (node) node.replace(tr)
          else tr.deleteSelection()
        }

        let pos = tr.mapping.map(insertPos)
        let isNode =
          slice.openStart == 0 &&
          slice.openEnd == 0 &&
          slice.content.childCount == 1
        let beforeInsert = tr.doc
        if (isNode) tr.replaceRangeWith(pos, pos, slice.content.firstChild!)
        else tr.replaceRange(pos, pos, slice)
        if (tr.doc.eq(beforeInsert)) {
          return true
        }

        let $pos = tr.doc.resolve(pos)
        if (
          isNode &&
          NodeSelection.isSelectable(slice.content.firstChild!) &&
          $pos.nodeAfter &&
          $pos.nodeAfter.sameMarkup(slice.content.firstChild!)
        ) {
          tr.setSelection(new NodeSelection($pos))
        } else {
          let end = tr.mapping.map(insertPos)
          tr.mapping.maps[tr.mapping.maps.length - 1]?.forEach(
            (_from, _to, _newFrom, newTo) => (end = newTo)
          )
          tr.setSelection(selectionBetween(view, $pos, tr.doc.resolve(end)))
        }
        view.focus()
        view.dispatch(tr.setMeta('uiEvent', 'drop'))
        return true
      },
    },
  })
}

function selectionBetween(
  view: EditorView,
  $anchor: ResolvedPos,
  $head: ResolvedPos,
  bias?: number
) {
  return (
    view.someProp('createSelectionBetween', (f) => f(view, $anchor, $head)) ||
    TextSelection.between($anchor, $head, bias)
  )
}

function createDropIndicatorView(
  view: EditorView,
  getTarget: GetTarget,
  options: DropIndicatorPluginOptions
): PluginView {
  const dom = view.dom
  let hideId: ReturnType<typeof setTimeout> | undefined
  let prevX: number | undefined
  let prevY: number | undefined
  let hasDragOverEvent: boolean = false

  const scheduleHide = () => {
    if (hideId) {
      clearTimeout(hideId)
    }

    hasDragOverEvent = false
    hideId = setTimeout(() => {
      if (hasDragOverEvent) return
      options.onHide()
    }, 30)
  }

  const handleDragOver = (event: DragEvent): void => {
    hasDragOverEvent = true

    const { clientX, clientY } = event
    if (prevX === clientX && prevY === clientY) {
      return
    }
    prevX = clientX
    prevY = clientY

    let target = getTarget([clientX, clientY], event)

    if (!target) {
      scheduleHide()
      return
    } else {
      const [pos, [x1, y1, x2, y2]] = target
      const line = { p1: { x: x1, y: y1 }, p2: { x: x2, y: y2 } }
      options.onShow({ view, pos, line })
    }
  }

  dom.addEventListener('dragover', handleDragOver)
  dom.addEventListener('dragend', scheduleHide)
  dom.addEventListener('drop', scheduleHide)
  dom.addEventListener('dragleave', scheduleHide)

  const destroy = () => {
    dom.removeEventListener('dragover', handleDragOver)
    dom.removeEventListener('dragend', scheduleHide)
    dom.removeEventListener('drop', scheduleHide)
    dom.removeEventListener('dragleave', scheduleHide)
  }

  return { destroy }
}
