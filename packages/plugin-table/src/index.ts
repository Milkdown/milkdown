import { createRemarkPlugin } from '@milkdown/core';
import gfm from 'remark-gfm';
import { keymapPlugin, KeymapPluginOptions } from './keymap';
import { nodes } from './nodes';

const remarkGFMPlugin = createRemarkPlugin('remark-table-markdown', () => [gfm]);

export const table = (options: KeymapPluginOptions = {}) => [...nodes, remarkGFMPlugin, keymapPlugin(options)];

export { createTable } from './utils';
