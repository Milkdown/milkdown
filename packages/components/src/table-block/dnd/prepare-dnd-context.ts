import type { DragContext, Refs } from '../view/types'

export function prepareDndContext(refs: Refs): DragContext | undefined {
  const {
    dragPreviewRef,
    tableWrapperRef,
    contentWrapperRef,
    yLineHandleRef,
    xLineHandleRef,
    colHandleRef,
    rowHandleRef,
  } = refs

  const preview = dragPreviewRef.value
  if (!preview) return
  const wrapper = tableWrapperRef.value
  if (!wrapper) return
  const content = contentWrapperRef.value
  if (!content) return
  const contentRoot = content.querySelector('tbody')
  if (!contentRoot) return
  const previewRoot = preview.querySelector('tbody')
  if (!previewRoot) return
  const yHandle = yLineHandleRef.value
  if (!yHandle) return
  const xHandle = xLineHandleRef.value
  if (!xHandle) return
  const colHandle = colHandleRef.value
  if (!colHandle) return
  const rowHandle = rowHandleRef.value
  if (!rowHandle) return

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
