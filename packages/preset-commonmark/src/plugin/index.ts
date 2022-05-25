/* Copyright 2021, Milkdown by Mirone. */
import { createPlugin } from '@milkdown/utils';
import links from 'remark-inline-links';

import { filterHTMLPlugin } from './filter-html';
import { inlineNodesCursorPlugin } from './inline-nodes-cursor';

export const commonmarkPlugins = [
    createPlugin(() => ({
        prosePlugins: () => [inlineNodesCursorPlugin],
        remarkPlugins: () => [links, filterHTMLPlugin],
    }))(),
];
