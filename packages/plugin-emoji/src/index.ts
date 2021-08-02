import { remarkPluginFactory } from '@milkdown/core';
import remarkEmoji from 'remark-emoji';
import { emojiNode } from './node';
import { twemojiPlugin } from './remark-twemoji';

export const emoji = [emojiNode(), remarkPluginFactory([remarkEmoji, twemojiPlugin])];
