import { customAlphabet } from 'nanoid'

// DOM-id-safe random suffix. Kept short since it only needs to
// disambiguate internal inputs within a single page.
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8)

// Create a unique id for an internal input element, so a host page
// passes Chrome's "A form field element should have an id or name
// attribute" audit. An `id` keeps the input out of a host `<form>`
// submission, which a shared `name` would join.
export function inputId(prefix: string): string {
  return `${prefix}-${nanoid()}`
}
