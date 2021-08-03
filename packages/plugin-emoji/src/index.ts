import { remarkPluginFactory } from '@milkdown/core';
import remarkEmoji from 'remark-emoji';
import { filter } from './filter';
import { emojiNode } from './node';
import { picker } from './picker';
import { twemojiPlugin } from './remark-twemoji';

export const remarkPlugin = remarkPluginFactory([remarkEmoji, twemojiPlugin]);
export const emoji = [emojiNode(), remarkPlugin, picker, filter];

export { emojiNode } from './node';
export { filter } from './filter';
export { picker } from './picker';
