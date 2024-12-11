import { MilkdownError } from './error';
export declare function docTypeError(type: unknown): MilkdownError;
export declare function contextNotFound(name: string): MilkdownError;
export declare function timerNotFound(name: string): MilkdownError;
export declare function ctxCallOutOfScope(): MilkdownError;
export declare function createNodeInParserFail(...args: unknown[]): MilkdownError;
export declare function stackOverFlow(): MilkdownError;
export declare function parserMatchError(node: unknown): MilkdownError;
export declare function serializerMatchError(node: unknown): MilkdownError;
export declare function getAtomFromSchemaFail(type: 'mark' | 'node', name: string): MilkdownError;
export declare function expectDomTypeError(node: unknown): MilkdownError;
export declare function callCommandBeforeEditorView(): MilkdownError;
export declare function missingRootElement(): MilkdownError;
export declare function missingNodeInSchema(name: string): MilkdownError;
export declare function missingMarkInSchema(name: string): MilkdownError;
export declare function ctxNotBind(): MilkdownError;
export declare function missingYjsDoc(): MilkdownError;
//# sourceMappingURL=index.d.ts.map