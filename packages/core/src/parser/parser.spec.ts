import remark from 'remark';
import { parse } from './parser';
import { Node } from 'unist';

const markdown = `***my* QAQ** paragraph`;

test('Parser/Test', () => {
    const node: Node = parse(markdown);
    const omitPosition = (node: Node) => {
        const tmp = { ...node };

        if (tmp.position) {
            delete tmp.position;
        }

        if (tmp.children) {
            tmp.children = (tmp.children as Node[]).map((c) => omitPosition(c));
        }

        return tmp;
    };

    const nextNode = omitPosition(node);

    // console.log(nextNode);
    console.log(JSON.stringify(nextNode, null, 4));

    console.log(remark.stringify(nextNode));
    // console.log((node.children as Node[])[0]);
    // console.log((node.children as any)[0].children[0]);
    // console.log(JSON.stringify(node, null, 4));
});
