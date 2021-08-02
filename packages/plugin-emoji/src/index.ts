import { remarkPluginFactory } from '@milkdown/core';
import remarkEmoji from 'remark-emoji';
import { emojiNode } from './node';
import { picker } from './picker';
import { twemojiPlugin } from './remark-twemoji';

export const emoji = [emojiNode(), remarkPluginFactory([remarkEmoji, twemojiPlugin]), picker];
