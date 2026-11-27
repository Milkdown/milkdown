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

const DEFAULT_RATIO = 1
const WRITTEN_DEFAULT_RATIO = DEFAULT_RATIO.toFixed(2)

/// A whole alt that is a decimal number is a ratio, as it always was, so a
/// ratio written by hand such as `0.5` keeps working.
const WHOLE_ALT_RATIO = /^\d+\.\d+$/

/// After alt text, only the form the serializer writes is a ratio.
const WRITTEN_RATIO = /^\d+\.\d{2}$/

/// The ratio in the form the serializer writes it, or null for a ratio that
/// has no such form, such as 0 or NaN.
function formatRatio(ratio: number): string | null {
  const formatted = ratio.toFixed(2)
  return WRITTEN_RATIO.test(formatted) && Number(formatted) > 0
    ? formatted
    : null
}

/// Whether the ratio is written as the default ratio. A ratio that cannot be
/// written counts as the default.
export function isDefaultRatio(ratio: number): boolean {
  const written = formatRatio(ratio)
  return written === null || written === WRITTEN_DEFAULT_RATIO
}

export function parseImageBlockAlt(value: string): ImageBlockAlt {
  if (WHOLE_ALT_RATIO.test(value)) {
    // The ratio is read with the two decimals it is written with, so that the
    // node matches its own Markdown.
    const written = formatRatio(Number(value))
    return {
      alt: null,
      ratio: written === null ? DEFAULT_RATIO : Number(written),
    }
  }

  const index = value.lastIndexOf('|')
  if (index !== -1) {
    const suffix = value.slice(index + 1)
    if (WRITTEN_RATIO.test(suffix) && formatRatio(Number(suffix)) !== null)
      return { alt: value.slice(0, index), ratio: Number(suffix) }
  }

  return { alt: value, ratio: DEFAULT_RATIO }
}

export function serializeImageBlockAlt({ alt, ratio }: ImageBlockAlt): string {
  const written = formatRatio(ratio) ?? WRITTEN_DEFAULT_RATIO
  if (alt === null) return written
  if (written !== WRITTEN_DEFAULT_RATIO) return `${alt}|${written}`

  // Alt text that would read back as a ratio, such as `0.75` or `x|0.75`,
  // gets an explicit default ratio so that it reads back as text.
  return parseImageBlockAlt(alt).alt === alt
    ? alt
    : `${alt}|${WRITTEN_DEFAULT_RATIO}`
}
