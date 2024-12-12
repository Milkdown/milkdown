import type { DefineFeature, Icon } from '../shared';
interface ImageBlockConfig {
    onUpload: (file: File) => Promise<string>;
    inlineImageIcon: Icon;
    inlineConfirmButton: Icon;
    inlineUploadButton: Icon;
    inlineUploadPlaceholderText: string;
    inlineOnUpload: (file: File) => Promise<string>;
    blockImageIcon: Icon;
    blockConfirmButton: Icon;
    blockCaptionIcon: Icon;
    blockUploadButton: Icon;
    blockCaptionPlaceholderText: string;
    blockUploadPlaceholderText: string;
    blockOnUpload: (file: File) => Promise<string>;
}
export type ImageBlockFeatureConfig = Partial<ImageBlockConfig>;
export declare const defineFeature: DefineFeature<ImageBlockFeatureConfig>;
export {};
//# sourceMappingURL=index.d.ts.map