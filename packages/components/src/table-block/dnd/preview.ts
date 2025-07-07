export function clearPreview(previewRoot: HTMLElement) {
  while (previewRoot.firstChild) previewRoot.removeChild(previewRoot.firstChild)
}

export function renderPreview(
  axis: 'x' | 'y',
  preview: HTMLElement,
  previewRoot: HTMLElement,
  tableContent: HTMLElement,
  index: number
) {
  const { width: tableWidth, height: tableHeight } = tableContent
    .querySelector('tbody')!
    .getBoundingClientRect()
  if (axis === 'y') {
    const rows = tableContent.querySelectorAll('tr')
    const row = rows[index]
    if (!row) return

    previewRoot.appendChild(row.cloneNode(true))
    const height = row.getBoundingClientRect().height

    Object.assign(preview.style, {
      width: `${tableWidth}px`,
      height: `${height}px`,
    })

    preview.dataset.show = 'true'

    return
  }

  if (axis === 'x') {
    const rows = tableContent.querySelectorAll('tr')
    let width: number | undefined

    Array.from(rows).forEach((row) => {
      const col = row.children[index]
      if (!col) return

      if (width === undefined) width = col.getBoundingClientRect().width

      const tr = col.parentElement!.cloneNode(false)
      const clone = col.cloneNode(true)
      tr.appendChild(clone)
      previewRoot.appendChild(tr)
    })

    Object.assign(preview.style, {
      width: `${width}px`,
      height: `${tableHeight}px`,
    })

    preview.dataset.show = 'true'

    return
  }
}
