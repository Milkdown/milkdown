import type { Schema, NodeType, MarkType } from 'prosemirror-model';
import type { Stack } from './stack';
import remark from 'remark';
import type { Node as MarkdownNode } from 'unist';
import { SpecMap, Value } from '.';

export class State {
    constructor(public readonly stack: Stack, public readonly schema: Schema, private readonly specMap: SpecMap) {}

    #matchTarget(node: MarkdownNode): Value & { key: string } {
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

    runParser(markdown: string) {
        const tree = remark().parse(markdown);

        this.next(tree);

        return this;
    }

    addText(text: string) {
        if (!text) return;

        this.stack.addText((marks) => this.schema.text(text, marks));
    }

    toDoc() {
        return this.stack.build();
    }

    next(nodes: MarkdownNode | MarkdownNode[] = []) {
        if (Array.isArray(nodes)) {
            nodes.forEach((node) => this.#runNode(node));
            return;
        }
        this.#runNode(nodes);
    }
}
