/* Copyright 2021, Milkdown by Mirone. */
import { serializerMatchError } from '@milkdown/exception';
import type { Fragment, Mark as ProseMark, Node as ProseNode, Schema } from '@milkdown/prose';

import { RemarkParser } from '../utility';
import type { Stack } from './stack';
import type { InnerSerializerSpecMap, MarkSerializerSpec, NodeSerializerSpec } from './types';

const isFragment = (x: ProseNode | Fragment): x is Fragment => Object.prototype.hasOwnProperty.call(x, 'size');

type StateMethod<T extends keyof Stack> = (...args: Parameters<Stack[T]>) => State;

/**
 * State for serializer.
 * Transform prosemirror state into remark AST.
 */
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
        const getPriority = (x: ProseMark) => x.type.spec.priority ?? 50;
        const tmp = [...marks].sort((a, b) => getPriority(a) - getPriority(b));
        const unPreventNext = tmp.every((mark) => !this.#runProseMark(mark, node));
        if (unPreventNext) {
            this.#runProseNode(node);
        }
        marks.forEach((mark) => this.stack.closeMark(mark));
    }

    /**
     * Transform a prosemirror node tree into remark AST.
     *
     * @param tree - The prosemirror node tree needs to be transformed.
     *
     * @returns The state instance.
     */
    run(tree: ProseNode) {
        this.next(tree);

        return this;
    }

    /**
     * Use a remark parser to serialize current AST stored.
     *
     * @param remark - The remark parser needs to used.
     * @returns Result markdown string.
     */
    toString = (remark: RemarkParser): string => remark.stringify(this.stack.build()) as string;

    /**
     * Give the node or node list back to the state and the state will find a proper runner (by `match` method) to handle it.
     *
     * @param nodes - The node or node list needs to be handled.
     *
     * @returns The state instance.
     */
    next = (nodes: ProseNode | Fragment) => {
        if (isFragment(nodes)) {
            nodes.forEach((node) => {
                this.#runNode(node);
            });
            return this;
        }
        this.#runNode(nodes);
        return this;
    };

    /**
     * Add a node without open or close it.
     *
     * @remarks
     * It's useful for nodes which don't have content.
     *
     * @param type - Type of this node.
     * @param children - Children of this node.
     * @param value - Value of this node.
     * @param props - Additional props of this node.
     *
     * @returns The added node.
     */
    addNode: StateMethod<'addNode'> = (...args) => {
        this.stack.addNode(...args);
        return this;
    };

    /**
     * Open a node, and all nodes created after this method will be set as the children of the node until a `closeNode` been called.
     *
     * @remarks
     * You can imagine `openNode` as the left half of parenthesis and `closeNode` as the right half. For nodes have children, your runner should just take care of the node itself and let other runners to handle the children.
     *
     * @param type - Type of this node.
     * @param value - Value of this node.
     * @param props - Additional props of this node.
     *
     * @returns The state instance.
     */
    openNode: StateMethod<'openNode'> = (...args) => {
        this.stack.openNode(...args);
        return this;
    };

    /**
     * Close current node.
     *
     * @returns The node closed.
     */
    closeNode: StateMethod<'closeNode'> = (...args) => {
        this.stack.closeNode(...args);
        return this;
    };

    /**
     * Used when current node has marks, the serializer will auto combine marks nearby.
     *
     * @param mark - The mark need to be opened.
     * @param type - Type of this mark.
     * @param value - Value of this mark.
     * @param props - Additional props of this mark.
     *
     * @returns The state instance.
     */
    withMark: StateMethod<'openMark'> = (...args) => {
        this.stack.openMark(...args);
        return this;
    };
}
