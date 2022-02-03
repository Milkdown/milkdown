/* Copyright 2021, Milkdown by Mirone. */
import { $prose } from '@milkdown/utils';
import type { Refractor } from 'refractor/lib/core';

import { Prism } from './prism';

export type Options = {
    nodeName: string;
    configureRefractor: (refractor: Refractor) => void;
};

export const prismPlugin = (options: Partial<Options> = {}) => {
    const overrideOptions: Options = {
        nodeName: 'fence',
        configureRefractor: () => {
            // doNothing
        },
        ...options,
    };

    return $prose(() => {
        return Prism(overrideOptions);
    });
};

export const prism = prismPlugin();
