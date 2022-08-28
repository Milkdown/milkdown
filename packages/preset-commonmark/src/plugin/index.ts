/* Copyright 2021, Milkdown by Mirone. */
import { createPlugin } from '@milkdown/utils';
import links from 'remark-inline-links';

import { addOrderInList } from './add-order-in-list';
import { filterHTMLPlugin } from './filter-html';
import { getInlineNodesCursorPlugin } from './inline-nodes-cursor';
import { getInlineSyncPlugin } from './inline-sync';

export const commonmarkPlugins = [
    createPlugin(() => ({
        prosePlugins: (_, ctx) => [getInlineNodesCursorPlugin(), getInlineSyncPlugin(ctx)],
        remarkPlugins: () => [links, filterHTMLPlugin, addOrderInList],
    }))(),
];
