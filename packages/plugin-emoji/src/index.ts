/* Copyright 2021, Milkdown by Mirone. */
import { AtomList } from '@milkdown/utils';

import { emojiNode } from './node';
export * from './node';

export const emoji = AtomList.create([emojiNode()]);
