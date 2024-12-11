import type { LanguageDescription, LanguageSupport } from '@codemirror/language';
export interface LanguageInfo {
    name: string;
    alias: readonly string[];
}
export declare class LanguageLoader {
    private languages;
    private readonly map;
    constructor(languages: LanguageDescription[]);
    getAll(): LanguageInfo[];
    load(languageName: string): Promise<LanguageSupport | undefined>;
}
//# sourceMappingURL=loader.d.ts.map