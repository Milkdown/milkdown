import MarkdownIt from 'markdown-it';
import { InputRule, inputRules } from 'prosemirror-inputrules';
import { EditorState, Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { baseKeymap } from 'prosemirror-commands';
import { Schema, Node as ProsemirrorNode } from 'prosemirror-model';
import { history, redo, undo } from 'prosemirror-history';

import { createParser } from './parser';
import { createSerializer } from './serializer';
import { keymap } from 'prosemirror-keymap';
import { Node, Mark } from './abstract';
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

type Constructor = { new (x: unknown): unknown };

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
    private keymap: Plugin[];
    private markdownIt: MarkdownIt;
    private plugins: Plugin[];
    private onChange?: OnChange;

    constructor({
        root,
        onChange,
        defaultValue = '',
        markdownIt = new MarkdownIt('commonmark'),
        getNodes = (x) => x,
        getMarks = (x) => x,
        plugins = [],
    }: Options) {
        this.loadState = LoadState.Idle;
        this.markdownIt = markdownIt;
        this.onChange = onChange;
        this.root = root;

        this.nodes = getNodes(nodes).map<Node>(this.createInstance);
        this.marks = getMarks(marks).map<Mark>(this.createInstance);

        this.schema = this.createSchema();
        this.parser = this.createParser();
        this.serializer = this.createSerializer();
        this.inputRules = this.createInputRules();
        this.keymap = this.createKeymap();

        this.plugins = plugins;

        this.view = this.createView(root, defaultValue);
        this.loadState = LoadState.Complete;
    }

    public get value() {
        return this.serializer(this.view.state.doc);
    }

    private createInstance = <T>(Cons: unknown): T => {
        return new (Cons as Constructor)(this) as T;
    };

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
        const nodesInputRules = this.nodes
            .filter((node) => Boolean(node.inputRules))
            .reduce((acc, cur) => {
                const node = this.schema.nodes[cur.name];
                if (!node) return acc;
                return [...acc, ...(cur as Required<Node>).inputRules(node, this.schema)];
            }, [] as InputRule[]);
        const marksInputRules = this.marks
            .filter((mark) => Boolean(mark.inputRules))
            .reduce((acc, cur) => {
                const mark = this.schema.marks[cur.name];
                if (!mark) return acc;
                return [...acc, ...(cur as Required<Mark>).inputRules(mark, this.schema)];
            }, [] as InputRule[]);

        return [...nodesInputRules, ...marksInputRules];
    }

    private createKeymap() {
        const nodesKeymap = this.nodes
            .filter((node) => Boolean(node.keymap))
            .map((cur) => {
                const node = this.schema.nodes[cur.name];
                if (!node) throw new Error();
                return (cur as Required<Node>).keymap(node);
            });
        const marksKeymap = this.marks
            .filter((mark) => Boolean(mark.keymap))
            .map((cur) => {
                const mark = this.schema.marks[cur.name];
                if (!mark) throw new Error();
                return (cur as Required<Mark>).keymap(mark);
            });
        const historyKeymap = {
            'Mod-z': undo,
            'Shift-Mod-z': redo,
        };

        return [...nodesKeymap, ...marksKeymap, historyKeymap].map((keys) => keymap(keys));
    }

    private createView(root: Element, defaultValue: string) {
        const container = this.createViewContainer(root);
        const state = this.createEditorState(defaultValue);
        const view = new EditorView(container, {
            state,
            dispatchTransaction: (tr) => {
                const nextState = view.state.apply(tr);
                view.updateState(nextState);

                this.onChange?.(() => this.value);
            },
        });
        this.prepareViewDom(view.dom);
        return view;
    }

    private createEditorState(defaultValue: string) {
        const doc = this.parser(defaultValue);
        return EditorState.create({
            schema: this.schema,
            doc,
            plugins: [
                history(),
                inputRules({ rules: this.inputRules }),
                ...this.keymap,
                keymap(baseKeymap),
                ...this.plugins,
            ],
        });
    }

    private createViewContainer(root: Element) {
        const container = document.createElement('div');
        container.className = 'milkdown';
        root.appendChild(container);

        return container;
    }

    private prepareViewDom(dom: Element) {
        dom.classList.add('editor');
        dom.setAttribute('role', 'textbox');
    }
}
