import type { Keymap } from 'prosemirror-commands';
import type { Schema } from 'prosemirror-model';
import type { InputRule } from 'prosemirror-inputrules';
import type { Editor } from '../editor';
import type { ParserSpec } from '../parser/types';

export interface Base<T = unknown> {
    inputRules?(markType: T, schema: Schema): InputRule[];
    keymap?(markType: T): Keymap;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export abstract class Base<T = unknown> {
    abstract readonly name: string;
    abstract readonly parser: ParserSpec;
    constructor(readonly editor: Editor) {}
}
