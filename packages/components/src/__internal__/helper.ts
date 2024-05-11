export function defIfNotExists(tagName: string, element: CustomElementConstructor) {
  if (customElements.get(tagName) == null)
    customElements.define(tagName, element)
}
