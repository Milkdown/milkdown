import { html } from 'atomico';
export interface ImageBlockConfig {
    imageIcon: () => ReturnType<typeof html> | string | HTMLElement;
    captionIcon: () => ReturnType<typeof html> | string | HTMLElement;
    uploadButton: () => ReturnType<typeof html> | string | HTMLElement;
    confirmButton: () => ReturnType<typeof html> | string | HTMLElement;
    uploadPlaceholderText: string;
    captionPlaceholderText: string;
    onUpload: (file: File) => Promise<string>;
}
export declare const defaultImageBlockConfig: ImageBlockConfig;
export declare const imageBlockConfig: import("@milkdown/utils").$Ctx<ImageBlockConfig, "imageBlockConfigCtx">;
//# sourceMappingURL=config.d.ts.map