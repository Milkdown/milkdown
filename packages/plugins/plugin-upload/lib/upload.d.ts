import type { Fragment, Node, Schema } from '@milkdown/prose/model';
import { Decoration } from '@milkdown/prose/view';
export type Uploader = UploadOptions['uploader'];
export interface UploadOptions {
    uploader: (files: FileList, schema: Schema) => Promise<Fragment | Node | Node[]>;
    enableHtmlFileUploader: boolean;
    uploadWidgetFactory: (pos: number, spec: Parameters<typeof Decoration.widget>[2]) => Decoration;
}
export declare const uploadConfig: import("@milkdown/utils").$Ctx<UploadOptions, "uploadConfig">;
export declare const uploadPlugin: import("@milkdown/utils").$Prose;
//# sourceMappingURL=upload.d.ts.map