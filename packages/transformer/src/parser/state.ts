/* Copyright 2021, Milkdown by Mirone. */
import { parserMatchError } from '@milkdown/exception';
import type { MarkType, NodeType, Schema } from '@milkdown/prose';

import { RemarkParser } from '../utility';
import type { Stack } from './stack';
import type { Attrs, InnerParserSpecMap, MarkdownNode, ParserSpecWithType } from './types';

type PS<T extends keyof Stack> = Parameters<Stack[T]>;

/**
 * State for parser.
 * Transform remark AST into prosemirror state.
 */
export class State {
    constructor(
        private readonly stack: Stack,
        public readonly schema: Schema,
        private readonly specMap: InnerParserSpecMap,
    ) {}

    #matchTarget(node: MarkdownNode): ParserSpecWithType {
        const result = Object.values(this.specMap).find((x) => x.match(node));

        if (!result) throw parserMatchError(node);

        return result;
    }

    #runNode(node: MarkdownNode) {
        const { key, runner, is } = this.#matchTarget(node);

        const proseType: NodeType | MarkType = this.schema[is === 'node' ? 'nodes' : 'marks'][key];
        runner(this, node, proseType as NodeType & MarkType);
    }

    /**
     * Transform a markdown string into prosemirror state.
     *
     * @param remark - The remark parser used.
     * @param markdown - The markdown string needs to be parsed.
     * @returns The state instance.
     */
    run = (remark: RemarkParser, markdown: string) => {
        const tree = remark.runSync(remark.parse(markdown)) as MarkdownNode;
        this.next(tree);

        return this;
    };

    /**
     * Give the node or node list back to the state and the state will find a proper runner (by `match` method) to handle it.
     *
     * @param nodes - The node or node list needs to be handled.
     *
     * @returns The state instance.
     */
    next = (nodes: MarkdownNode | MarkdownNode[] = []) => {
        [nodes].flat().forEach((node) => this.#runNode(node));
        return this;
    };

    /**
     * Parse current remark AST into prosemirror state.
     *
     * @returns Result prosemirror doc.
     */
    toDoc = () => this.stack.build();

    /**
     * Inject root node for prosemirror state.
     *
     * @param node - The target markdown node.
     * @param nodeType - The root prosemirror nodeType .
     * @param attrs - The attribute of root type.
     * @returns The state instance.
     */
    injectRoot = (node: MarkdownNode, nodeType: NodeType, attrs?: Attrs) => {
        this.stack.openNode(nodeType, attrs);
        this.next(node.children);

        return this;
    };

    /**
     * Add a text type prosemirror node.
     *
     * @param text - Text string.
     * @returns The state instance.
     */
    addText = (text = '') => {
        this.stack.addText(text);
        return this;
    };

    /**
     * Add a node without open or close it.
     *
     * @remarks
     * It's useful for nodes which don't have content.
     *
     * @param nodeType - Node type of this node.
     * @param attrs - Attributes of this node.
     * @param content - Content of this node.
     *
     * @returns The added node.
     */
    addNode = (...args: PS<'addNode'>) => {
        this.stack.addNode(...args);
        return this;
    };

    /**
     * Open a node, and all nodes created after this method will be set as the children of the node until a `closeNode` been called.
     *
     * @remarks
     * You can imagine `openNode` as the left half of parenthesis and `closeNode` as the right half. For nodes have children, your runner should just take care of the node itself and let other runners to handle the children.
     *
     * @param nodeType - Node type of this node.
     * @param attrs - Attributes of this node.
     *
     * @returns
     */
    openNode = (...args: PS<'openNode'>) => {
        this.stack.openNode(...args);
        return this;
    };

    /**
     * Close current node.
     *
     * @returns The node closed.
     */
    closeNode = (...args: PS<'closeNode'>) => {
        this.stack.closeNode(...args);
        return this;
    };

    /**
     * Open a mark, and all marks created after this method will be set as the children of the mark until a `closeMark` been called.
     *
     * @remarks
     * You can imagine `openMark` as the left half of parenthesis and `closeMark` as the right half. For nodes have children, your runner should just take care of the node itself and let other runners to handle the children.
     *
     * @param markType - Mark type of this mark.
     * @param attrs - Attributes of this mark.
     *
     * @returns
     */
    openMark = (...args: PS<'openMark'>) => {
        this.stack.openMark(...args);
        return this;
    };

    /**
     * Close target mark.
     *
     * @param markType - Mark type of this mark.
     *
     * @returns The mark closed.
     */
    closeMark = (...args: PS<'closeMark'>) => {
        this.stack.closeMark(...args);
        return this;
    };
}
