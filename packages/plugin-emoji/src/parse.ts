import twemoji from 'twemoji';

export const parse = (emoji: string) => twemoji.parse(emoji, { attributes: (text) => ({ title: text }) });
