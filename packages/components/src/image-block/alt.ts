/// The alt of an image block carries both the alt text and the resize ratio:
///
/// - `![0.75](src)` is the original format: the whole alt is the ratio, and
///   the block has no alt text.
/// - `![A red barn|0.75](src)` is alt text with a ratio after the last `|`.
/// - `![A red barn](src)` is alt text at the default ratio.

export interface ImageBlockAlt {
  alt: string | null
  ratio: number
}

const DEFAULT_RATIO = '1.00'

/// A whole alt that is a decimal number is a ratio, as it always was, so a
/// ratio written by hand such as `0.5` keeps working.
const WHOLE_ALT_RATIO = /^\d+\.\d+$/

/// After alt text, only the form the serializer writes is a ratio.
const WRITTEN_RATIO = /^\d+\.\d{2}$/

function toRatio(value: string): number | null {
  const ratio = Number(value)
  return Number.isFinite(ratio) && ratio > 0 ? ratio : null
}

export function parseImageBlockAlt(value: string): ImageBlockAlt {
  if (WHOLE_ALT_RATIO.test(value))
    return { alt: null, ratio: toRatio(value) ?? 1 }

  const index = value.lastIndexOf('|')
  if (index !== -1) {
    const suffix = value.slice(index + 1)
    const ratio = WRITTEN_RATIO.test(suffix) ? toRatio(suffix) : null
    if (ratio !== null) return { alt: value.slice(0, index), ratio }
  }

  return { alt: value, ratio: 1 }
}

export function serializeImageBlockAlt({ alt, ratio }: ImageBlockAlt): string {
  const formatted = Number.parseFloat(String(ratio)).toFixed(2)
  // A ratio that cannot be read back, such as 0 or NaN, is written as the
  // default ratio.
  const written =
    WRITTEN_RATIO.test(formatted) && toRatio(formatted) !== null
      ? formatted
      : DEFAULT_RATIO

  if (alt === null) return written
  if (written !== DEFAULT_RATIO) return `${alt}|${written}`

  // Alt text that would read back as a ratio, such as `0.75` or `x|0.75`,
  // gets an explicit default ratio so that it reads back as text.
  return parseImageBlockAlt(alt).alt === alt ? alt : `${alt}|${DEFAULT_RATIO}`
}
