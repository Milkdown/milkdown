/* Copyright 2021, Milkdown by Mirone. */
// import { SupportedKeys } from '@milkdown/preset-commonmark';
import '@milkdown/prose/model';

import { RemarkPlugin } from '@milkdown/core';
import { createPlugin } from '@milkdown/utils';
import directive from 'remark-directive';

export const remarkDirective = createPlugin(() => {
    return {
        remarkPlugins: () => [directive as RemarkPlugin],
    };
});
