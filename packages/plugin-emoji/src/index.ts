/* Copyright 2021, Milkdown by Mirone. */
import { remarkPluginFactory } from '@milkdown/core';
import { AtomList } from '@milkdown/utils';
import remarkEmoji from 'remark-emoji';

import { filter } from './filter';
import { emojiNode } from './node';
import { picker } from './picker';
import { twemojiPlugin } from './remark-twemoji';

export const remarkPlugin = remarkPluginFactory([remarkEmoji, twemojiPlugin]);
export const emoji = AtomList.create([emojiNode(), remarkPlugin, picker, filter]);

export { filter } from './filter';
export { emojiNode } from './node';
export { picker } from './picker';
