/* Copyright 2021, Milkdown by Mirone. */
import twemoji from 'twemoji';

const setAttr = (text: string) => ({ title: text });

export const parse = (emoji: string, twemojiOptions?: TwemojiOptions): string =>
    twemoji.parse(emoji, { attributes: setAttr, ...twemojiOptions }) as unknown as string;
