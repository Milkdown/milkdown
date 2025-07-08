import type { Ctx } from '@milkdown/ctx'

import { editorViewCtx } from '@milkdown/core'

import type { DragContext, Refs } from '../view/types'

import { prepareDndContext } from './prepare-dnd-context'
import { clearPreview, renderPreview } from './preview'

export function createDragRowHandler(refs: Refs, ctx?: Ctx) {
  return (event: DragEvent) => {
    handleDrag(refs, event, ctx, (context) => {
      updateDragInfo('y', event, context, refs)

      const { preview, content, previewRoot } = context

      clearPreview(previewRoot)

      const { hoverIndex } = refs
      const [rowIndex] = hoverIndex.value
      renderPreview('y', preview, previewRoot, content, rowIndex)
    })
  }
}

export function createDragColHandler(refs: Refs, ctx?: Ctx) {
  return (event: DragEvent) => {
    handleDrag(refs, event, ctx, (context) => {
      updateDragInfo('x', event, context, refs)

      const { preview, content, previewRoot } = context

      const { hoverIndex } = refs
      const [_, colIndex] = hoverIndex.value

      clearPreview(previewRoot)

      renderPreview('x', preview, previewRoot, content, colIndex)
    })
  }
}

function updateDragInfo(
  axis: 'x' | 'y',
  event: DragEvent,
  context: DragContext,
  refs: Refs
) {
  const { xHandle, yHandle, colHandle, rowHandle, preview } = context
  xHandle.dataset.displayType = axis === 'y' ? 'indicator' : 'none'
  yHandle.dataset.displayType = axis === 'x' ? 'indicator' : 'none'

  if (axis === 'y') {
    colHandle.dataset.show = 'false'
    hideButtonGroup(rowHandle)
  } else {
    rowHandle.dataset.show = 'false'
    hideButtonGroup(colHandle)
  }

  const { hoverIndex, dragInfo } = refs
  const [rowIndex, colIndex] = hoverIndex.value

  dragInfo.value = {
    startCoords: [event.clientX, event.clientY],
    startIndex: axis === 'y' ? rowIndex : colIndex,
    endIndex: axis === 'y' ? rowIndex : colIndex,
    type: axis === 'y' ? 'row' : 'col',
  }

  preview.dataset.direction = axis === 'y' ? 'vertical' : 'horizontal'
}

function handleDrag(
  refs: Refs,
  event: DragEvent,
  ctx: Ctx | undefined,
  fn: (context: DragContext) => void
) {
  const view = ctx?.get(editorViewCtx)
  if (!view?.editable) return

  event.stopPropagation()
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'

  const context = prepareDndContext(refs)

  if (!context) return

  // This is to avoid a chrome bug:
  // https://stackoverflow.com/questions/14203734/dragend-dragenter-and-dragleave-firing-off-immediately-when-i-drag
  requestAnimationFrame(() => {
    fn(context)
  })
}

function hideButtonGroup(handle: HTMLElement) {
  handle.querySelector('.button-group')?.setAttribute('data-show', 'false')
}
