/* Copyright 2021, Milkdown by Mirone. */
import { AtomList, createPlugin } from '@milkdown/utils';
import remarkMath from 'remark-math';

import { nodes } from './nodes';

const remarkPlugin = createPlugin(() => {
    return {
        remarkPlugins: () => [remarkMath],
    };
});

export const math = AtomList.create([remarkPlugin(), ...nodes]);
export * from './nodes';
