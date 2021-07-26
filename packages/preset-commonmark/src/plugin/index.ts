import { remarkPluginFactory } from '@milkdown/core';
import links from 'remark-inline-links';

export const commonmarkPlugins = [remarkPluginFactory(links)];
