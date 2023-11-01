/* Copyright 2021, Milkdown by Mirone. */
export function trapFocus(focusNode: HTMLElement, rootNode = document.body) {
  const CANDIDATES = `
    a, button, input, select, textarea, svg, area, details, summary,
    iframe, object, embed,
    [tabindex], [contenteditable]
  `
  const map = new WeakMap<Element, string | null>()
  const nodes = Array.from(rootNode.querySelectorAll(CANDIDATES)).filter(
    node => !focusNode.contains(node) && node.getAttribute('tabindex') !== '-1',
  )
  nodes.forEach((node) => {
    map.set(node, node.getAttribute('tabindex'))
    node.setAttribute('tabindex', '-1')
  })
  return () => {
    nodes.forEach((node) => {
      const prev = map.get(node)
      if (prev) {
        node.setAttribute('tabindex', prev)
        return
      }
      node.removeAttribute('tabindex')
    })
  }
}
