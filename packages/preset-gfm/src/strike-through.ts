import type { MarkParserSpec, MarkSerializerSpec } from '@milkdown/core';
import { BaseMark, markRule } from '@milkdown/utils';
import { toggleMark } from 'prosemirror-commands';
import type { InputRule } from 'prosemirror-inputrules';
import type { MarkSpec } from 'prosemirror-model';
import { SupportedKeys } from '.';

type Keys = SupportedKeys['StrikeThrough'];

export class StrikeThrough extends BaseMark<Keys> {
    override readonly id = 'strike_through';
    override readonly schema: MarkSpec = {
        parseDOM: [
            { tag: 'del' },
            { style: 'text-decoration', getAttrs: (value) => (value === 'line-through') as false },
        ],
        toDOM: (mark) => ['del', { class: this.getClassName(mark.attrs, 'strike-through') }],
    };
    override readonly parser: MarkParserSpec = {
        match: (node) => node.type === 'delete',
        runner: (state, node, markType) => {
            state.openMark(markType);
            state.next(node.children);
            state.closeMark(markType);
        },
    };
    override readonly serializer: MarkSerializerSpec = {
        match: (mark) => mark.type.name === this.id,
        runner: (state, mark) => {
            state.withMark(mark, 'delete');
        },
    };
    override readonly inputRules: BaseMark<Keys>['inputRules'] = (markType): InputRule[] => [
        markRule(/(?:~~)([^~]+)(?:~~)$/, markType),
        markRule(/(?:^|[^~])(~([^~]+)~)$/, markType),
    ];
    override readonly commands: BaseMark<Keys>['commands'] = (markType) => ({
        [SupportedKeys.StrikeThrough]: {
            defaultKey: 'Mod-Alt-x',
            command: toggleMark(markType),
        },
    });
}
