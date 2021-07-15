import type { MarkParserSpec, MarkSerializerSpec } from '@milkdown/core';
import { table } from '@milkdown/plugin-table';
import { commonmark } from '@milkdown/preset-commonmark';
import { BaseMark, markRule } from '@milkdown/utils';
import { toggleMark } from 'prosemirror-commands';
import type { InputRule } from 'prosemirror-inputrules';
import type { MarkSpec } from 'prosemirror-model';
import { TaskListItem } from './task-list-item';

export enum SupportedKeys {
    StrikeThrough = 'StrikeThrough',
    NextListItem = 'NextListItem',
    SinkListItem = 'SinkListItem',
    LiftListItem = 'LiftListItem',
}

type Keys = SupportedKeys.StrikeThrough;

export class StrikeThrough extends BaseMark<Keys> {
    override readonly id = 'strike_through';
    override readonly schema: MarkSpec = {
        parseDOM: [
            { tag: 'del' },
            { style: 'text-decoration', getAttrs: (value) => (value === 'line-through') as false },
        ],
        toDOM: (mark) => ['del', { class: this.getClassName(mark.attrs) }],
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
            defaultKey: 'Mod-Shift-x',
            command: toggleMark(markType),
        },
    });
}

export const gfm = [...commonmark, ...table, new StrikeThrough(), new TaskListItem()];
