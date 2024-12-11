import type { Node } from '@milkdown/prose/model';
declare function defaultHeadingIdGenerator(node: Node): string;
export declare const headingIdGenerator: import("@milkdown/utils").$Ctx<typeof defaultHeadingIdGenerator, "headingIdGenerator">;
export declare const headingAttr: import("@milkdown/utils").$NodeAttr;
export declare const headingSchema: import("@milkdown/utils").$NodeSchema<"heading">;
export declare const wrapInHeadingInputRule: import("@milkdown/utils").$InputRule;
export declare const wrapInHeadingCommand: import("@milkdown/utils").$Command<number>;
export declare const downgradeHeadingCommand: import("@milkdown/utils").$Command<unknown>;
export declare const headingKeymap: import("@milkdown/utils").$UserKeymap<"headingKeymap", "DowngradeHeading" | "TurnIntoH1" | "TurnIntoH2" | "TurnIntoH3" | "TurnIntoH4" | "TurnIntoH5" | "TurnIntoH6">;
export {};
//# sourceMappingURL=heading.d.ts.map