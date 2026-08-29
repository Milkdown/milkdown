/// The html literal the serializer emits to keep an empty paragraph from
/// being folded away by markdown. Emitted by `paragraphSchema` and folded
/// back by `remarkPreserveEmptyLinePlugin`.
export const EMPTY_LINE_PLACEHOLDER = '<br />'

const BR_PATTERN = /^<br\s*\/?\s*>$/i

/// Whether an html node value is a `<br>` in any spelling
/// (`<br>`, `<br/>`, `<br />`, any casing, extra whitespace).
export const isBrHtmlValue = (value: unknown): boolean =>
  typeof value === 'string' && BR_PATTERN.test(value.trim())
