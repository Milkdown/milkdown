/* Copyright 2021, Milkdown by Mirone. */

export const linkRegexp = /\[([^\]]+)]\([^\s\]]+\)/

export const keepLinkRegexp = /\[(?<span>((www|https:\/\/|http:\/\/)[^\s\]]+))]\((?<url>[^\s\]]+)\)/

export const punctuationRegexp = (holePlaceholder: string) =>
  new RegExp(`\\\\(?=[^\\w\\s${holePlaceholder}\\\\]|_)`, 'g')

export const ZERO_WIDTH_SPACE = '\u200B'

export const asterisk = `${ZERO_WIDTH_SPACE}*${ZERO_WIDTH_SPACE}`
export const asteriskHolder = `${ZERO_WIDTH_SPACE}＊${ZERO_WIDTH_SPACE}`
export const underline = `${ZERO_WIDTH_SPACE}_${ZERO_WIDTH_SPACE}`
export const underlineHolder = `${ZERO_WIDTH_SPACE}⎽${ZERO_WIDTH_SPACE}`
