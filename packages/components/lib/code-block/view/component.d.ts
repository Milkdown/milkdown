import type { EditorView as CodeMirror } from '@codemirror/view';
import type { Component } from 'atomico';
import type { CodeBlockConfig } from '../config';
import type { LanguageInfo } from './loader';
export interface CodeComponentProps {
    selected: boolean;
    codemirror: CodeMirror;
    language: string;
    getAllLanguages: () => Array<LanguageInfo>;
    setLanguage: (language: string) => void;
    isEditorReadonly: () => boolean;
    config: Omit<CodeBlockConfig, 'languages' | 'extensions'>;
}
export declare const codeComponent: Component<CodeComponentProps>;
export declare const CodeElement: import("atomico/types/dom").Atomico<CodeComponentProps | (CodeComponentProps & import("atomico/types/component").SyntheticMetaProps<any>), CodeComponentProps | (CodeComponentProps & import("atomico/types/component").SyntheticMetaProps<any>), {
    new (): HTMLElement;
    prototype: HTMLElement;
}>;
//# sourceMappingURL=component.d.ts.map