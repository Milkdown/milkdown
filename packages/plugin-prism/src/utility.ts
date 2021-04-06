import { Node } from 'prosemirror-model';

const flatten = (node: Node, descend = true) => {
    const result: { node: Node; pos: number }[] = [];
    node.descendants((child, pos) => {
        result.push({ node: child, pos });
        if (!descend) {
            return false;
        }
        return undefined;
    });
    return result;
};

const findChildren = (predicate: (node: Node) => boolean) => (node: Node, descend?: boolean) => {
    return flatten(node, descend).filter((child) => predicate(child.node));
};

export const findBlockNodes = findChildren((child) => child.isBlock);
