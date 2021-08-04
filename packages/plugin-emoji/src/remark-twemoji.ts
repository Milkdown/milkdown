import { Node, Literal, Parent } from 'unist';
import { parse } from './parse';
import emojiRegex from 'emoji-regex';

const regex = emojiRegex();

const isParent = (node: Node): node is Parent => !!(node as Parent).children;
const isLiteral = (node: Node): node is Literal => !!(node as Literal).value;

function flatMap(ast: Node, fn: (node: Node, index: number, parent: Node | null) => Node[]) {
    return transform(ast, 0, null)[0];

    function transform(node: Node, index: number, parent: Node | null) {
        if (isParent(node)) {
            const out = [];
            for (let i = 0, n = node.children.length; i < n; i++) {
                const xs = transform(node.children[i], i, node);
                if (xs) {
                    for (let j = 0, m = xs.length; j < m; j++) {
                        out.push(xs[j]);
                    }
                }
            }
            node.children = out;
        }

        return fn(node, index, parent);
    }
}

export const twemojiPlugin = () => {
    function transformer(tree: Node) {
        flatMap(tree, (node) => {
            if (!isLiteral(node)) {
                return [node];
            }
            const value = node.value as string;
            const output: Literal<string>[] = [];
            let match;
            let str = value;
            while ((match = regex.exec(str))) {
                const { index } = match;
                const emoji = match[0];
                if (index > 0) {
                    output.push({ ...node, value: str.slice(0, index) });
                }
                output.push({ ...node, value: parse(emoji), type: 'emoji' });
                str = str.slice(index + emoji.length);
            }
            if (str.length) {
                output.push({ ...node, value: str });
            }
            return output;
        });
    }
    return transformer;
};
