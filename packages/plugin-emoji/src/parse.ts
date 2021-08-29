/* Copyright 2021, Milkdown by Mirone. */
import twemoji from 'twemoji';

export const parse = (emoji: string) => twemoji.parse(emoji, { attributes: (text) => ({ title: text }) });
