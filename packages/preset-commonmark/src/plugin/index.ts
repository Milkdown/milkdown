/* Copyright 2021, Milkdown by Mirone. */
import { createPlugin } from '@milkdown/utils';
import links from 'remark-inline-links';

import { filterHTMLPlugin } from './filter-html';

export const commonmarkPlugins = [
    createPlugin(() => ({
        remarkPlugins: () => [links, filterHTMLPlugin],
    }))(),
];
