import { parser } from './parser';
import type { Node } from 'unist';

test('parser', () => {
    const node = parser();

    console.log(node);
    console.log(JSON.stringify((node.children as Node[])[0], null, 4));
    // console.log(JSON.stringify(node, null, 4));
});
