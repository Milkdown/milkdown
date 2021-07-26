import { AtomList } from '@milkdown/utils';
import { marks } from './mark';
import { nodes } from './node';
import { commonmarkPlugins } from './plugin';

export * from './node';
export * from './mark';
export * from './supported-keys';

export const commonmarkNodes = AtomList.create([...nodes, ...marks]);
export { commonmarkPlugins };
export const commonmark = [...commonmarkPlugins, ...commonmarkNodes];
