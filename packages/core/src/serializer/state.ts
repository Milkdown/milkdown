import remark from 'remark';
import type { Mark as ProseMark, Node as ProseNode, Fragment, Schema } from 'prosemirror-model';
import type { Stack } from './stack';
import type { InnerSerializerSpecMap, SerializerSpecWithType } from './types';

const isFragment = (x: ProseNode | Fragment): x is Fragment => Object.prototype.hasOwnProperty.call(x, 'size');

export class State {
    constructor(
        private readonly stack: Stack,
        public readonly schema: Schema,
        private readonly specMap: InnerSerializerSpecMap,
    ) {}

    #matchTarget(node: ProseMark | ProseNode): SerializerSpecWithType & { key: string } {
        const result = Object.entries(this.specMap)
            .map(([key, spec]) => ({
                key,
                ...spec,
            }))
            .find((x) => x.match(node as ProseMark & ProseNode));

        if (!result) throw new Error();

        return result;
    }

    #runProse(node: ProseMark | ProseNode) {
        const { runner } = this.#matchTarget(node);
        runner(node as ProseNode & ProseMark, this);
    }

    #runNode(node: ProseNode) {
        const { marks } = node;
        marks.forEach((mark) => this.#runProse(mark));
        this.#runProse(node);
    }

    run(tree: ProseNode) {
        this.next(tree);

        return this;
    }

    next = (node: ProseNode | Fragment) => {
        if (isFragment(node)) {
            node.forEach((n) => {
                this.#runNode(n);
            });
            return;
        }
        this.#runNode(node);
    };

    addNode: Stack['addNode'] = this.stack.addNode;

    openNode: Stack['openNode'] = this.stack.openNode;

    closeNode: Stack['closeNode'] = this.stack.closeNode;

    toString = (): string => remark().stringify(this.stack.build());

    openMark: Stack['openMark'] = this.stack.openMark;

    closeMark: Stack['closeMark'] = this.stack.closeMark;
}
