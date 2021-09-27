/* Copyright 2021, Milkdown by Mirone. */
import { AtomList } from '@milkdown/utils';

import { mathBlock } from './math-block';
import { mathInline } from './math-inline';

export const nodes = AtomList.create([mathInline(), mathBlock()]);
export * from './math-block';
export * from './math-inline';
