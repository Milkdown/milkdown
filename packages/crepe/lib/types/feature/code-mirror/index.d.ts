import type { LanguageDescription } from '@codemirror/language';
import type { Extension } from '@codemirror/state';
import type { html } from 'atomico';
import type { DefineFeature, Icon } from '../shared';
interface CodeMirrorConfig {
    extensions: Extension[];
    languages: LanguageDescription[];
    theme: Extension;
    expandIcon: Icon;
    searchIcon: Icon;
    clearSearchIcon: Icon;
    searchPlaceholder: string;
    noResultText: string;
    renderLanguage: (language: string, selected: boolean) => ReturnType<typeof html> | string | HTMLElement;
}
export type CodeMirrorFeatureConfig = Partial<CodeMirrorConfig>;
export declare const defineFeature: DefineFeature<CodeMirrorFeatureConfig>;
export {};
//# sourceMappingURL=index.d.ts.map