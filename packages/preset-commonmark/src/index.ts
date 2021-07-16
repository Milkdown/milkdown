import { AtomList } from '@milkdown/utils';
import { marks } from './mark';
import { nodes } from './node';

export * from './node';
export * from './mark';
export * from './supported-keys';

export const commonmark = AtomList.create([...nodes, ...marks]);
