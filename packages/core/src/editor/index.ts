import MarkdownIt from 'markdown-it';
import { InputRule, inputRules } from 'prosemirror-inputrules';
import { EditorState, Plugin as ProsemirrorPlugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { baseKeymap } from 'prosemirror-commands';
import { Schema, Node as ProsemirrorNode } from 'prosemirror-model';
import { history, redo, undo } from 'prosemirror-history';

import { Plugin, PluginLoader } from './plugin';
import { createParser } from '../parser';
import { createSerializer } from '../serializer';
import { keymap } from 'prosemirror-keymap';
import { Node, Mark } from '../abstract';
import { marks } from '../mark';
import { nodes } from '../node';
import { buildObject } from '../utility/buildObject';
import { MarkView, NodeView } from '../utility/prosemirror';
import { View } from './view';

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
    private keymap: ProsemirrorPlugin[];
    private markdownIt: MarkdownIt;
    private pluginLoader: PluginLoader;
    public nodeViews: Record<string, NodeView | MarkView>;
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
        this.onChange = onChange;
        this.root = root;

        this.pluginLoader = new PluginLoader(plugins);

        this.nodes = this.pluginLoader.loadNodes(getNodes, nodes).map<Node>(this.createInstance);
        this.marks = this.pluginLoader.loadMarks(getMarks, marks).map<Mark>(this.createInstance);

        this.markdownIt = markdownIt;
        this.pluginLoader.loadMarkdownPlugin(markdownIt);

        this.schema = this.createSchema();
        this.parser = this.createParser();
        this.serializer = this.createSerializer();
        this.inputRules = this.createInputRules();
        this.keymap = this.createKeymap();
        this.nodeViews = this.createNodeViews();
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

        return [...nodesKeymap, ...marksKeymap].map((keys) => keymap(keys));
    }

    private createNodeViews() {
        const nodeViews = this.nodes
            .filter((node) => Boolean(node.view))
            .reduce((acc, cur) => {
                const node = this.schema.nodes[cur.name];
                if (!node) throw new Error();
                return {
                    ...acc,
                    [cur.name]: (...args: Parameters<NodeView>) => (cur as Required<Node>).view(this, node, ...args),
                };
            }, {});

        const markViews = this.marks
            .filter((mark) => Boolean(mark.view))
            .reduce((acc, cur) => {
                const mark = this.schema.marks[cur.name];
                if (!mark) throw new Error();
                return {
                    ...acc,
                    [cur.name]: (...args: Parameters<MarkView>) => (cur as Required<Mark>).view(this, mark, ...args),
                };
            }, {});

        return { ...nodeViews, ...markViews };
    }

    private createView(root: Element, defaultValue: string) {
        const state = this.createEditorState(defaultValue);
        const { view } = new View(root, state, this.nodeViews, (v) => {
            this.onChange?.(() => this.serializer(v.state.doc));
        });
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
                keymap({
                    'Mod-z': undo,
                    'Shift-Mod-z': redo,
                }),
                keymap(baseKeymap),
                ...this.pluginLoader.loadProsemirrorPlugin(this.schema, this.view),
            ],
        });
    }
}

export { createPlugin, Plugin, PluginConfig } from './plugin';
