/* Copyright 2021, Milkdown by Mirone. */

export const linkRegexp = /\[(?<span>((www|https:\/\/|http:\/\/)[^\s\]]+))]\((?<url>[^\s\]]+)\)/

export const punctuationRegexp = (holePlaceholder: string) =>
  new RegExp(`\\\\(?=[^\\w\\s${holePlaceholder}\\\\]|_)`, 'g')
