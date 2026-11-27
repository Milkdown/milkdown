/// The alt of an image block carries both the alt text and the resize ratio:
///
/// - `![0.75](src)` is the original format: the whole alt is the ratio, and
///   the block has no alt text.
/// - `![A red barn|0.75](src)` is alt text with a ratio after the last `|`.
/// - `![A red barn](src)` is alt text at the default ratio.
///
/// A ratio is only read in the form the serializer writes it, such as `0.75`,
/// so other alt text, a number like `2024` or `1.5` included, stays text.

export interface ImageBlockAlt {
  alt: string | null
  ratio: number
}

const DEFAULT_RATIO = '1.00'

function readRatio(value: string): number | null {
  const ratio = Number(value)
  if (!Number.isFinite(ratio) || ratio <= 0) return null
  return ratio.toFixed(2) === value ? ratio : null
}

export function parseImageBlockAlt(value: string): ImageBlockAlt {
  const ratio = readRatio(value)
  if (ratio !== null) return { alt: null, ratio }

  const index = value.lastIndexOf('|')
  if (index !== -1) {
    const suffixRatio = readRatio(value.slice(index + 1))
    if (suffixRatio !== null)
      return { alt: value.slice(0, index), ratio: suffixRatio }
  }

  return { alt: value, ratio: 1 }
}

export function serializeImageBlockAlt({ alt, ratio }: ImageBlockAlt): string {
  const formatted = Number.parseFloat(String(ratio)).toFixed(2)
  if (alt === null) return formatted

  const resized = formatted !== DEFAULT_RATIO && readRatio(formatted) !== null
  // An empty alt has no text to keep, so a resized one uses the original
  // format, which older versions can read.
  if (resized) return alt ? `${alt}|${formatted}` : formatted

  // Alt text that would read back as a ratio, such as `0.75` or `x|0.75`,
  // gets an explicit default ratio so that it reads back as text.
  const parsed = parseImageBlockAlt(alt)
  return parsed.alt === alt && parsed.ratio === 1
    ? alt
    : `${alt}|${DEFAULT_RATIO}`
}
