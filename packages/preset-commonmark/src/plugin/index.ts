/* Copyright 2021, Milkdown by Mirone. */
import { remarkPluginFactory } from '@milkdown/core';
import links from 'remark-inline-links';

import { filterHTMLPlugin } from './filter-html';

export const commonmarkPlugins = [remarkPluginFactory([links, filterHTMLPlugin])];
