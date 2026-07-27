import { customAlphabet } from 'nanoid'

// DOM-id-safe random suffix. Kept short since it only needs to
// disambiguate internal inputs within a single page.
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8)

// Create a unique id for an internal input element, so host pages pass
// Chrome's "A form field element should have an id or name attribute"
// audit. We use `id` rather than a shared `name` so these inputs do not
// leak into host `<form>` submissions when the editor is embedded.
export function inputId(prefix: string): string {
  return `${prefix}-${nanoid()}`
}
