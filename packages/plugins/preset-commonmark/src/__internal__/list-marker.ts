/// The marker of a bullet list in markdown.
export type BulletMarker = '-' | '*' | '+'

/// The character after the number of an ordered list item in markdown.
export type OrderedDelimiter = '.' | ')'

export const isBulletMarker = (marker: unknown): marker is BulletMarker =>
  marker === '-' || marker === '*' || marker === '+'

export const isOrderedDelimiter = (
  delimiter: unknown
): delimiter is OrderedDelimiter => delimiter === '.' || delimiter === ')'
