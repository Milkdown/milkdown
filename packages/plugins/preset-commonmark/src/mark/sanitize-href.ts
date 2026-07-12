/// Protocols that are safe to expose as a real, navigable `href`.
const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:', 'ftp:'])

/// Characters browsers strip while resolving a URL's protocol. They are
/// commonly injected to smuggle a dangerous scheme past a naive check,
/// e.g. `java\tscript:` still resolves to `javascript:` in the browser.
/// Covers C0/C1 control chars and space, zero-width chars, unicode
/// line/paragraph separators and the byte-order mark.
function isIgnoredChar(code: number): boolean {
  return (
    code <= 0x20 ||
    (code >= 0x7f && code <= 0xa0) ||
    (code >= 0x200b && code <= 0x200d) ||
    code === 0x2028 ||
    code === 0x2029 ||
    code === 0xfeff
  )
}

function stripIgnoredChars(input: string): string {
  let out = ''
  for (const char of input) {
    if (!isIgnoredChar(char.codePointAt(0) ?? 0)) out += char
  }
  return out
}

/// Returns `href` when it points at a safe location, otherwise an empty
/// string. Relative URLs, query strings and fragments (which carry no
/// scheme) are always considered safe; only values with an explicit
/// non-allowlisted scheme (`javascript:`, `data:`, `vbscript:`, ...) are
/// stripped. Use this at every sink that turns a stored `href` into a real
/// DOM anchor to prevent stored XSS.
export function sanitizeLinkHref(href: unknown): string {
  if (typeof href !== 'string') return ''

  const trimmed = href.trim()
  if (!trimmed) return ''

  // Normalize away characters the browser ignores when parsing the scheme,
  // so obfuscated schemes are detected by their real protocol.
  const normalized = stripIgnoredChars(trimmed)

  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(normalized)?.[1]
  // No explicit scheme: relative path, fragment or query string. Always safe.
  if (!scheme) return trimmed

  if (SAFE_PROTOCOLS.has(`${scheme.toLowerCase()}:`)) return trimmed

  return ''
}
