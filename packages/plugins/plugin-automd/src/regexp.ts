export const linkRegexp = /\[([^\]]+)]\([^\s\]]+\)/

export const emailCandidateRegexp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9.-]+$/

export const trailingPunctuationRegexp = /[.,:;!?\s\u2042\u2234\u2205]+$/

export const keepLinkRegexp =
  /\[(?<span>((www|https:\/\/|http:\/\/)[^\s\]]+))]\((?<url>[^\s\]]+)\)/

export function punctuationRegexp(holePlaceholder: string) {
  return new RegExp(`\\\\(?=[^\\w\\s${holePlaceholder}\\\\]|_)`, 'g')
}

const ZERO_WIDTH_SPACE = '\u200B'

export const asterisk = `${ZERO_WIDTH_SPACE}*`
export const asteriskHolder = `${ZERO_WIDTH_SPACE}＊`
export const underline = `${ZERO_WIDTH_SPACE}_`
export const underlineHolder = `${ZERO_WIDTH_SPACE}⎽`
