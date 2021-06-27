import remark from 'remark';
import type { Node } from 'unist';

export const parse = (markdown: string): Node => remark().parse(markdown);
