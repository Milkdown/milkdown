import type { MarkParserSpec, MarkSerializerSpec } from '@milkdown/core';
import { toggleMark } from 'prosemirror-commands';
import type { InputRule } from 'prosemirror-inputrules';
import type { MarkSpec, MarkType } from 'prosemirror-model';
import { SupportedKeys } from '../supported-keys';
import { BaseMark, markRule } from '../utility';

type Keys = SupportedKeys.CodeInline;

export class CodeInline extends BaseMark<Keys> {
    override readonly id = 'code_inline';
    override readonly schema: MarkSpec = {
        excludes: '_',
        parseDOM: [{ tag: 'code' }],
        toDOM: (mark) => ['code', { class: this.getClassName(mark.attrs, 'code-inline') }],
    };
    override readonly parser: MarkParserSpec = {
        match: (node) => node.type === 'inlineCode',
        runner: (state, node, markType) => {
            state.openMark(markType);
            state.addText(node.value as string);
            state.closeMark(markType);
        },
    };
    override readonly serializer: MarkSerializerSpec = {
        match: (mark) => mark.type.name === this.id,
        runner: (state, mark) => {
            state.withMark(mark, 'emphasis');
        },
    };
    override readonly inputRules = (markType: MarkType): InputRule[] => [markRule(/(?:^|[^`])(`([^`]+)`)$/, markType)];
    override readonly commands: BaseMark<Keys>['commands'] = (markType: MarkType) => ({
        [SupportedKeys.CodeInline]: {
            defaultKey: 'Mod-e',
            command: toggleMark(markType),
        },
    });
}
