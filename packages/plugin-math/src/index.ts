/* Copyright 2021, Milkdown by Mirone. */
import { remarkPluginFactory } from '@milkdown/core';
import { AtomList } from '@milkdown/utils';
import remarkMath from 'remark-math';

import { nodes } from './nodes';

export const math = AtomList.create([remarkPluginFactory(remarkMath), ...nodes]);
export * from './nodes';
