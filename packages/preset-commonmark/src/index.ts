import { marks } from './mark';
import { nodes } from './node';

export * from './node';
export * from './mark';
export const commonmark = [...nodes, ...marks];
