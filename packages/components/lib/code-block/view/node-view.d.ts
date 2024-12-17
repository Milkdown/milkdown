import type { EditorView, NodeView } from '@milkdown/prose/view';
import { EditorView as CodeMirror } from '@codemirror/view';
import type { Node } from '@milkdown/prose/model';
import type { CodeBlockConfig } from '../config';
import type { CodeComponentProps } from './component';
import type { LanguageLoader } from './loader';
export declare class CodeMirrorBlock implements NodeView {
    node: Node;
    view: EditorView;
    getPos: () => number | undefined;
    loader: LanguageLoader;
    config: CodeBlockConfig;
    dom: HTMLElement & CodeComponentProps;
    cm: CodeMirror;
    private updating;
    private languageName;
    private readonly languageConf;
    private readonly readOnlyConf;
    constructor(node: Node, view: EditorView, getPos: () => number | undefined, loader: LanguageLoader, config: CodeBlockConfig);
    private forwardUpdate;
    private createDom;
    private updateLanguage;
    private codeMirrorKeymap;
    private maybeEscape;
    setSelection(anchor: number, head: number): void;
    update(node: Node): boolean;
    selectNode(): void;
    deselectNode(): void;
    stopEvent(): boolean;
    destroy(): void;
    setLanguage: (language: string) => void;
    getAllLanguages: () => import("./loader").LanguageInfo[];
}
//# sourceMappingURL=node-view.d.ts.map