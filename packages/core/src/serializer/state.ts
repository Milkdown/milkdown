import type { Mark as ProseMark, Node as ProseNode, Schema } from 'prosemirror-model';
import { hasText } from '../utility/prosemirror';
import type { InnerSerializerSpecMap, SerializerSpec, SerializerSpecWithType } from './types';

import { Utility } from './utility';

export class State {
    #out = '';
    #delimitation = '';
    #toBeClosed: false | ProseNode = false;
    #specMap: InnerSerializerSpecMap;
    public utils = Utility;

    constructor(public readonly schema: Schema, specMap: InnerSerializerSpecMap) {
        this.#specMap = specMap;
    }

    #matchTarget(node: ProseMark | ProseNode): SerializerSpecWithType & { key: string } {
        const result = Object.entries(this.#specMap)
            .map(([key, spec]) => ({
                key,
                ...spec,
            }))
            .find((x) => x.match(node as ProseMark & ProseNode));

        if (!result) throw new Error();

        return result;
    }

    #runNode(node: ProseMark | ProseNode) {
        const { runner } = this.#matchTarget(node);
        runner(node as ProseNode & ProseMark, this);
    }

    get output() {
        return this.#out;
    }

    exec(doc: ProseNode) {
        return this.renderContent(doc);
    }

    /**
     * Render the contents of a given node.
     *
     * @param parent The parent of the contents to be rendered.
     * @returns State instance.
     */
    renderContent(parent: ProseNode) {
        parent.forEach((node: ProseNode, _: unknown, i: number) => this.#render(node, parent, i));

        return this;
    }

    /**
     * Ensure the end of the output is blank.
     *
     * @returns State instance.
     */
    ensureNewLine() {
        if (!this.#atBlank) this.#out += '\n';

        return this;
    }

    /**
     * Set a given node to be closed.
     *
     * @param node A given node.
     * @returns State instance.
     */
    closeBlock(node: ProseNode) {
        this.#toBeClosed = node;

        return this;
    }

    /**
     * Write the given content to the output.
     * Close node if have unclosed node.
     * Respect delimitation if output is at blank.
     *
     * @param content
     * @returns State instance.
     */
    write(content?: string) {
        this.#flushClose();
        if (!content) return this;

        if (this.#delimitation && this.#atBlank) this.#out += this.#delimitation;
        this.#out += content;

        return this;
    }

    /**
     * Add a text line by line use `write` method.
     * Respect line break.
     *
     * @param text Text need to be added.
     * @param escape Whether to escaped the special chars.
     * @returns State instance.
     */
    text(text: string, escape = false) {
        const lines = text.split('\n');
        lines.forEach((line, i) => {
            const nextLine = escape ? this.utils.escape(line, Boolean(this.#atBlank || this.#toBeClosed)) : line;
            this.write(nextLine);

            const isLastLine = i === lines.length - 1;
            if (!isLastLine) this.#out += '\n';
        });

        return this;
    }

    /**
     * Wrap a block with a `delimitation` as the prefix for each line.
     * If firstDelimitation provided, used as the prefix for the **first line**.
     * The serialize of node will be executed by the callback function.
     *
     * @param delimitation Prefix of each line.
     * @param node Node need to be wrapped.
     * @param f Callback function to render the node.
     * @param firstDelimitation Prefix of the first line.
     * @returns State instance.
     */
    wrapBlock(delimitation: string, node: ProseNode, f: () => void, firstDelimitation = delimitation) {
        this.write(firstDelimitation);

        const old = this.#delimitation;
        this.#delimitation += delimitation;
        f();
        this.#delimitation = old;

        this.closeBlock(node);

        return this;
    }

    /**
     * Render the contents of a given node as inline text.
     * Organize marks in it.
     *
     * @param parent The parent of the contents to be rendered.
     * @returns State instance.
     */
    renderInline(parent: ProseNode) {
        let marksNotClosed: ProseMark[] = [];

        const cleanUp = () => {
            const clearMarks = this.#serializeMarks(marksNotClosed, parent, parent.childCount + 1);

            this.write(clearMarks);
        };

        parent.forEach((node, _, index) => {
            if (!hasText(node)) {
                this.#render(node, parent, index);
                return;
            }

            const marks: ProseMark[] = node.marks || [];
            // Find marks not closed and not exists in current node
            const marksToBeClosed = marksNotClosed
                .filter((mark) => !marks.includes(mark))
                .sort(this.#compareMarkPriority());
            // Find new added marks
            const marksToBeOpened = marks
                .filter((mark) => !marksNotClosed.includes(mark))
                .sort(this.#compareMarkPriority(true));

            marksToBeOpened.forEach((mark) => marksNotClosed.push(mark));
            marksNotClosed = marksNotClosed
                .filter((mark) => !marksToBeClosed.includes(mark))
                .sort(this.#compareMarkPriority());

            const openMark = this.#serializeMarks(marksToBeOpened, parent, index, true);

            const closePreviousNodeMark = this.#serializeMarks(marksToBeClosed, parent, index + 1);

            this.write(closePreviousNodeMark + openMark + node.text);
        });

        cleanUp();

        return this;
    }

    /**
     * Render the contents of a given node as a list.
     * Add prefix for each content.
     *
     * @param parent The parent of the contents to be rendered.
     * @param delimitation The prefix for each content.
     * @param getFirstDelimitation The first line prefix for each content.
     */
    renderList(parent: ProseNode, delimitation: string, getFirstDelimitation: (index: number) => string) {
        if (this.#toBeClosed && this.#toBeClosed.type === parent.type) {
            this.#flushClose(2);
        }

        parent.forEach((child, _, i) => {
            this.wrapBlock(delimitation, parent, () => this.#render(child, parent, i), getFirstDelimitation(i));
        });
    }

    get #atBlank() {
        const emptyOrNewline = /(^|\n)$/;
        return emptyOrNewline.test(this.#out);
    }

    #serializeMarks(marks: ProseMark[], parent: ProseNode, index: number, isOpen = false) {
        return marks.map((mark) => this.#markString(mark, parent, index, isOpen)).join('');
    }

    #flushClose(size = 1) {
        if (!this.#toBeClosed) return this;

        if (!this.#atBlank) this.#out += '\n';

        const prefix = this.utils.removeWhiteSpaceAfter(this.#delimitation);
        this.#out += this.utils.repeat(prefix + '\n', size);
        this.#toBeClosed = false;

        return this;
    }

    #markString(mark: ProseMark, parent: ProseNode, index: number, isOpen = false) {
        const markInfo = this.#getMark(mark);
        const value = isOpen ? markInfo.open : markInfo.close;
        return typeof value === 'string' ? value : value(this, mark, parent, index);
    }

    #render(node: ProseNode, parent: ProseNode, index: number) {
        const renderer = this.#getNode(node);
        renderer(this, node, parent, index);
    }

    #compareMarkPriority(desc = false) {
        return (l: ProseMark, r: ProseMark) => {
            const pL = this.#getMark(l)?.priority ?? 0;
            const pR = this.#getMark(r)?.priority ?? 0;
            return desc ? pL - pR : pR - pL;
        };
    }

    #getMark(mark: ProseMark) {
        const markInfo = this.#marks[mark.type.name];
        if (!markInfo) throw new Error(`Fail to get mark ${mark.type.name} from mark map.`);
        return markInfo;
    }

    #getNode(node: ProseNode) {
        const nodeInfo = this.#nodes[node.type.name];
        if (!nodeInfo) throw new Error(`Fail to get node ${node.type.name} from node map.`);
        return nodeInfo;
    }
}
