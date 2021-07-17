import { Mark, MarkViewFactory } from '@milkdown/core';
import type { AnyRecord, UnknownRecord } from '../type-utility';
import { createKeymap } from './keymap';
import type { MarkOptional, MarkOptions } from './types';

export abstract class BaseMark<SupportedKeys extends parserCtx = parserCtx, Options = UnknownRecord>
    extends Mark<MarkOptions<SupportedKeys, Options>>
    implements MarkOptional<SupportedKeys>
{
    commands?: MarkOptional<SupportedKeys>['commands'];

    protected getClassName = (attrs: AnyRecord, defaultValue = this.id) =>
        this.options.className?.(attrs) ?? defaultValue;

    override readonly keymap: Mark['keymap'] = (type, schema) =>
        createKeymap(this.commands, this.options.keymap)(type, schema);
    override readonly view?: MarkViewFactory = this.options.view;
}
