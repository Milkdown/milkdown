import { Node, Mark } from '@milkdown/core';
import { AnyRecord } from './types';

type CommonOptions = {
    className?: (attrs: AnyRecord) => string;
};

export abstract class CommonNode<Options = Record<string, unknown>> extends Node<Options & CommonOptions> {
    protected getClassName(attrs: AnyRecord, defaultValue = this.id) {
        return this.options.className?.(attrs) ?? defaultValue;
    }
}

export abstract class CommonMark<Options = Record<string, unknown>> extends Mark<Options & CommonOptions> {
    protected getClassName(attrs: AnyRecord, defaultValue = this.id) {
        return this.options.className?.(attrs) ?? defaultValue;
    }
}
