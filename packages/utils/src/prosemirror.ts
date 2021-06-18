import type { Node } from 'prosemirror-model';
import type { Selection, Transaction } from 'prosemirror-state';

export type Position = {
    node: Node;
    pos: number;
};

export type Predicate<T> = (node: T) => boolean;

const flatten = (node: Node, descend = true): Position[] => {
    const result: Position[] = [];
    node.descendants((child, pos) => {
        result.push({ node: child, pos });
        if (!descend) {
            return false;
        }
        return undefined;
    });
    return result;
};

export const findChildren =
    (predicate: Predicate<Node>) =>
    (node: Node, descend?: boolean): Position[] =>
        flatten(node, descend).filter((child) => predicate(child.node));

export const findParentNode = (predicate: Predicate<Node>) => (selection: Selection) => {
    const { $from } = selection;
    for (let i = $from.depth; i > 0; i--) {
        const node = $from.node(i);
        if (predicate(node)) {
            return {
                pos: i > 0 ? $from.before(i) : 0,
                start: $from.start(i),
                depth: i,
                node,
            };
        }
    }
    return undefined;
};

export const findNodeInSelection =
    (predicate: Predicate<Node>) =>
    (selection: Selection, doc: Node): Position | undefined => {
        let found: Position | undefined;
        const { from, to } = selection;
        doc.nodesBetween(from, to, (node, pos) => {
            if (found) return false;
            if (predicate(node)) {
                found = {
                    node,
                    pos,
                };
            }
            return;
        });

        return found;
    };

export const cloneTr = (tr: Transaction) => {
    return Object.assign(Object.create(tr), tr).setTime(Date.now());
};
