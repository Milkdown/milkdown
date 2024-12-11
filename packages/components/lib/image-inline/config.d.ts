import { html } from 'atomico';
export interface InlineImageConfig {
    imageIcon: () => ReturnType<typeof html>;
    uploadButton: () => ReturnType<typeof html>;
    confirmButton: () => ReturnType<typeof html>;
    uploadPlaceholderText: string;
    onUpload: (file: File) => Promise<string>;
}
export declare const defaultInlineImageConfig: InlineImageConfig;
export declare const inlineImageConfig: import("@milkdown/utils").$Ctx<InlineImageConfig, "inlineImageConfigCtx">;
//# sourceMappingURL=config.d.ts.map