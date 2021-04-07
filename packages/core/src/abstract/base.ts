import type { Keymap } from 'prosemirror-commands';
import type { Schema } from 'prosemirror-model';
import type { InputRule } from 'prosemirror-inputrules';
import type { Editor } from '../editor';

export abstract class Base<T = unknown> {
    abstract readonly name: string;
    constructor(readonly editor: Editor) {}
    abstract inputRules(markType: T, schema: Schema): InputRule[];
    abstract keymap(markType: T): Keymap;
}
