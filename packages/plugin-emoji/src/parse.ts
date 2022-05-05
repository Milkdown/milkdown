/* Copyright 2021, Milkdown by Mirone. */
import twemoji from 'twemoji';

const setAttr = (text: string) => ({ title: text });

export const parse = (emoji: string): string => twemoji.parse(emoji, { attributes: setAttr }) as unknown as string;
