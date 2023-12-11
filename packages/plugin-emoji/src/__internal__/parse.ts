/* Copyright 2021, Milkdown by Mirone. */
import twemoji from 'twemoji'

const setAttr = (text: string) => ({ title: text })

export type TwemojiOptions = Parameters<typeof twemoji.parse>[1]

export function parse(emoji: string, twemojiOptions?: TwemojiOptions): string {
  return twemoji.parse(emoji, { attributes: setAttr, base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/', ...twemojiOptions }) as unknown as string
}
