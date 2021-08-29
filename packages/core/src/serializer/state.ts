/* Copyright 2021, Milkdown by Mirone. */
import { serializerMatchError } from '@milkdown/exception';
import type { Fragment, Mark as ProseMark, Node as ProseNode, Schema } from 'prosemirror-model';

import { RemarkParser } from '../internal-plugin';
import type { Stack } from './stack';
import type { InnerSerializerSpecMap, MarkSerializerSpec, NodeSerializerSpec } from './types';

const isFragment = (x: ProseNode | Fragment): x is Fragment => Object.prototype.hasOwnProperty.call(x, 'size');

type StateMethod<T extends keyof Stack> = (...args: Parameters<Stack[T]>) => State;

export class State {
    constructor(
        private readonly stack: Stack,
        public readonly schema: Schema,
        private readonly specMap: InnerSerializerSpecMap,
    ) {}

    #matchTarget<T extends ProseMark | ProseNode>(
        node: T,
    ): (T extends ProseNode ? NodeSerializerSpec : MarkSerializerSpec) & { key: string } {
        const result = Object.entries(this.specMap)
            .map(([key, spec]) => ({
                key,
                ...spec,
            }))
            .find((x) => x.match(node as ProseMark & ProseNode));

        if (!result) throw serializerMatchError(node.type);

        return result as never;
    }

    #runProseNode(node: ProseNode) {
        const { runner } = this.#matchTarget(node);
        runner(this, node);
    }

    #runProseMark(mark: ProseMark, node: ProseNode) {
        const { runner } = this.#matchTarget(mark);
        return runner(this, mark, node);
    }

    #runNode(node: ProseNode) {
        const { marks } = node;
        const unPreventNext = marks.every((mark) => !this.#runProseMark(mark, node));
        if (unPreventNext) {
            this.#runProseNode(node);
        }
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

    toString = (remark: RemarkParser): string => remark.stringify(this.stack.build());

    withMark: StateMethod<'openMark'> = (...args) => {
        this.stack.openMark(...args);
        return this;
    };
}
