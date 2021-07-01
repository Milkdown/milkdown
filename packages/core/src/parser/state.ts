import type { MarkType, NodeType, Schema } from 'prosemirror-model';
import type { Processor } from 'unified';
import type { RemarkOptions } from 'remark';
import type { Node as MarkdownNode } from 'unist';
import type { Attrs, InnerParserSpecMap, ParserSpecWithType } from '.';
import type { Stack } from './stack';

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
        runner(proseType as NodeType & MarkType, this, node);
    }

    run = (remark: Processor<RemarkOptions>, markdown: string) => {
        const tree = remark.parse(markdown);

        this.next(tree);

        return this;
    };

    injectRoot = (nodeType: NodeType, node: MarkdownNode, attrs?: Attrs) => {
        this.stack.openNode(nodeType, attrs);
        this.next(node.children as MarkdownNode[]);
    };

    addText = (text = '') => this.stack.addText((marks) => this.schema.text(text, marks));

    addNode = this.stack.addNode;

    openNode = this.stack.openNode;

    closeNode = this.stack.closeNode;

    openMark = this.stack.openMark;

    closeMark = this.stack.closeMark;

    toDoc = () => this.stack.build();

    next = (nodes: MarkdownNode | MarkdownNode[] = []) => {
        if (Array.isArray(nodes)) {
            nodes.forEach((node) => this.#runNode(node));
            return;
        }
        this.#runNode(nodes);
    };
}
