import type { MarkType, NodeType, Schema } from 'prosemirror-model';
import type { Node as MarkdownNode, Parent } from 'unist';
import type { Attrs, InnerParserSpecMap, ParserSpecWithType } from '.';
import type { Stack } from './stack';
import type { RemarkParser } from '../internal-plugin';

export class State {
    constructor(
        private readonly stack: Stack,
        public readonly schema: Schema,
        private readonly specMap: InnerParserSpecMap,
    ) {}

    #matchTarget(node: MarkdownNode): ParserSpecWithType & { key: string } {
        const result = Object.entries(this.specMap)
            .map(([key, spec]) => ({
                key,
                ...spec,
            }))
            .find((x) => x.match(node));

        if (!result) throw new Error();

        return result;
    }

    #runNode(node: MarkdownNode) {
        const { key, runner, is } = this.#matchTarget(node);

        const proseType: NodeType | MarkType = this.schema[is === 'node' ? 'nodes' : 'marks'][key];
        runner(this, node, proseType as NodeType & MarkType);
    }

    run = (remark: RemarkParser, markdown: string) => {
        const tree = remark.parse(markdown);

        this.next(tree);

        return this;
    };

    injectRoot = (node: MarkdownNode, nodeType: NodeType, attrs?: Attrs) => {
        this.stack.openNode(nodeType, attrs);
        this.next((node as Parent).children as MarkdownNode[]);

        return this;
    };

    addText = (text = '') => {
        this.stack.addText((marks) => this.schema.text(text, marks));
        return this;
    };

    addNode = (...args: Parameters<Stack['addNode']>) => {
        this.stack.addNode(...args);
        return this;
    };

    openNode = (...args: Parameters<Stack['openNode']>) => {
        this.stack.openNode(...args);
        return this;
    };

    closeNode = (...args: Parameters<Stack['closeNode']>) => {
        this.stack.closeNode(...args);
        return this;
    };

    openMark = (...args: Parameters<Stack['openMark']>) => {
        this.stack.openMark(...args);
        return this;
    };

    closeMark = (...args: Parameters<Stack['closeMark']>) => {
        this.stack.closeMark(...args);
        return this;
    };

    toDoc = () => this.stack.build();

    next = (nodes: MarkdownNode | MarkdownNode[] = []) => {
        if (Array.isArray(nodes)) {
            nodes.forEach((node) => this.#runNode(node));
        } else {
            this.#runNode(nodes);
        }
        return this;
    };
}
