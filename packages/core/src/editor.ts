import MarkdownIt from 'markdown-it';
import { InputRule, inputRules } from 'prosemirror-inputrules';
import { EditorState, Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { baseKeymap } from 'prosemirror-commands';
import { Schema, Node as ProsemirrorNode } from 'prosemirror-model';

import { createParser } from './parser';
import { createSerializer } from './serializer';
import { keymap } from 'prosemirror-keymap';
import { Node, Mark, Base } from './abstract';
import { marks } from './mark';
import { nodes } from './node';
import { buildObject } from './utility/buildObject';

export type OnChange = (getValue: () => string) => void;

export interface Options {
    root: Element;
    defaultValue?: string;
    markdownIt?: MarkdownIt;
    onChange?: OnChange;
    getNodes?: (preset: typeof Node[]) => typeof Node[];
    getMarks?: (preset: typeof Mark[]) => typeof Mark[];
    plugins?: Plugin[];
}

export enum LoadState {
    Idle,
    Complete,
}

export class Editor {
    public readonly schema: Schema;
    public readonly view: EditorView;
    public readonly loadState: LoadState;
    public readonly root: Element;

    private parser: (text: string) => ProsemirrorNode | null;
    private serializer: (node: ProsemirrorNode) => string;
    private nodes: Node[];
    private marks: Mark[];
    private inputRules: InputRule[];
    private markdownIt: MarkdownIt;
    private plugins: Plugin[];
    private onChange?: OnChange;

    constructor({
        root,
        defaultValue = '',
        markdownIt = new MarkdownIt('commonmark'),
        onChange,
        getNodes,
        getMarks,
        plugins = [],
    }: Options) {
        this.loadState = LoadState.Idle;
        this.markdownIt = markdownIt;
        this.onChange = onChange;
        this.root = root;

        this.nodes = (getNodes?.(nodes) ?? nodes).map((N: unknown) => new (N as typeof Base)(this) as Node);
        this.marks = (getMarks?.(marks) ?? marks).map((M: unknown) => new (M as typeof Base)(this) as Mark);

        this.schema = this.createSchema();
        this.parser = this.createParser();
        this.serializer = this.createSerializer();
        this.inputRules = this.createInputRules();

        this.plugins = plugins;

        this.view = this.createView(root, defaultValue);
        this.loadState = LoadState.Complete;
    }

    public get value() {
        return this.serializer(this.view.state.doc);
    }

    private createSchema() {
        const nodes = buildObject(this.nodes, (node) => [node.name, node.schema]);
        const marks = buildObject(this.marks, (mark) => [mark.name, mark.schema]);

        return new Schema({
            nodes: {
                doc: { content: 'block+' },
                ...nodes,
                text: { group: 'inline' },
            },
            marks,
        });
    }

    private createParser() {
        const children = [...this.nodes, ...this.marks];
        const spec = buildObject(children, (child) => [child.name, child.parser]);
        return createParser(this.schema, this.markdownIt, spec);
    }

    private createSerializer() {
        const nodes = buildObject(this.nodes, (node) => [node.name, node.serializer], {
            text(state, node) {
                const { text } = node;
                if (!text) return;
                state.text(text);
            },
        });
        const marks = buildObject(this.marks, (mark) => [mark.name, mark.serializer]);
        return createSerializer(nodes, marks);
    }

    private createInputRules() {
        const nodesInputRules = this.nodes.reduce((acc, cur) => {
            const node = this.schema.nodes[cur.name];
            if (!node) return acc;
            return [...acc, ...cur.inputRules(node, this.schema)];
        }, [] as InputRule[]);
        const marksInputRules = this.marks.reduce((acc, cur) => {
            const mark = this.schema.marks[cur.name];
            if (!mark) return acc;
            return [...acc, ...cur.inputRules(mark, this.schema)];
        }, [] as InputRule[]);

        return [...nodesInputRules, ...marksInputRules];
    }

    private createView(root: Element, defaultValue: string) {
        const container = document.createElement('div');
        container.className = 'milkdown';
        root.appendChild(container);
        const doc = this.parser(defaultValue);
        const state = EditorState.create({
            schema: this.schema,
            doc,
            plugins: [inputRules({ rules: this.inputRules }), keymap(baseKeymap), ...this.plugins],
        });
        const view = new EditorView(container, {
            state,
            dispatchTransaction: (tr) => {
                const nextState = view.state.apply(tr);
                view.updateState(nextState);

                this.onChange?.(() => this.value);
            },
        });
        view.dom.setAttribute('class', 'editor');
        view.dom.setAttribute('role', 'textbox');
        return view;
    }
}
