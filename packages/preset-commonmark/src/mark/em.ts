import type { MarkParserSpec, MarkSerializerSpec } from '@milkdown/core';
import { toggleMark } from 'prosemirror-commands';
import type { InputRule } from 'prosemirror-inputrules';
import type { MarkSpec, MarkType } from 'prosemirror-model';
import { BaseMark } from '@milkdown/utils';
import { SupportedKeys } from '../supported-keys';
import { markRule } from '../utility';

type Keys = SupportedKeys['Em'];

export class Em extends BaseMark {
    override readonly id = 'em';
    override readonly schema: MarkSpec = {
        parseDOM: [
            { tag: 'i' },
            { tag: 'em' },
            { style: 'font-style', getAttrs: (value) => (value === 'italic') as false },
        ],
        toDOM: (mark) => ['em', { class: this.getClassName(mark.attrs) }],
    };
    override readonly parser: MarkParserSpec = {
        match: (node) => node.type === 'emphasis',
        runner: (state, node, markType) => {
            state.openMark(markType);
            state.next(node.children);
            state.closeMark(markType);
        },
    };
    override readonly serializer: MarkSerializerSpec = {
        match: (mark) => mark.type.name === this.id,
        runner: (state, mark) => {
            state.withMark(mark, 'emphasis');
        },
    };
    override readonly inputRules = (markType: MarkType): InputRule[] => [
        markRule(/(?:^|[^_])(_([^_]+)_)$/, markType),
        markRule(/(?:^|[^*])(\*([^*]+)\*)$/, markType),
    ];
    override readonly commands: BaseMark<Keys>['commands'] = (markType: MarkType) => ({
        [SupportedKeys.Em]: {
            defaultKey: 'Mod-i',
            command: toggleMark(markType),
        },
    });
}
