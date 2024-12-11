export declare const imageAttr: import("@milkdown/utils").$NodeAttr;
export declare const imageSchema: import("@milkdown/utils").$NodeSchema<"image">;
export interface UpdateImageCommandPayload {
    src?: string;
    title?: string;
    alt?: string;
}
export declare const insertImageCommand: import("@milkdown/utils").$Command<UpdateImageCommandPayload>;
export declare const updateImageCommand: import("@milkdown/utils").$Command<UpdateImageCommandPayload>;
export declare const insertImageInputRule: import("@milkdown/utils").$InputRule;
//# sourceMappingURL=image.d.ts.map