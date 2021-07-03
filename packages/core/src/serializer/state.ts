import type { Processor } from 'unified';
import type { RemarkOptions } from 'remark';
import type { Mark as ProseMark, Node as ProseNode, Fragment, Schema } from 'prosemirror-model';
import type { Stack } from './stack';
import type { InnerSerializerSpecMap, SerializerSpecWithType } from './types';

const isFragment = (x: ProseNode | Fragment): x is Fragment => Object.prototype.hasOwnProperty.call(x, 'size');

type StateMethod<T extends keyof Stack> = (...args: Parameters<Stack[T]>) => State;

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
        marks.forEach((mark) => this.stack.closeMark(mark));
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
            return this;
        }
        this.#runNode(node);
        return this;
    };

    addNode: StateMethod<'addNode'> = (...args) => {
        this.stack.addNode(...args);
        return this;
    };

    openNode: StateMethod<'openNode'> = (...args) => {
        this.stack.openNode(...args);
        return this;
    };

    closeNode: StateMethod<'closeNode'> = (...args) => {
        this.stack.closeNode(...args);
        return this;
    };

    toString = (remark: Processor<RemarkOptions>): string => remark.stringify(this.stack.build());

    withMark: StateMethod<'openMark'> = (...args) => {
        this.stack.openMark(...args);
        return this;
    };
}
