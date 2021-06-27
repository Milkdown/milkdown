import { parse } from './parser';
import { Node } from 'unist';

const markdown = `*my* paragraph`;

test('parser', () => {
    const node: Node = parse(markdown);

    console.log((node.children as Node[])[0]);
    // console.log((node.children as any)[0].children[0]);
    // console.log(JSON.stringify(node, null, 4));
});
