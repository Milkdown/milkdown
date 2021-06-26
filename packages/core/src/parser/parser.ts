import remark from 'remark';
import type { Node } from 'unist';

export function parser(): Node {
    return remark().parse('*Emphasis* and **importance**');
}
