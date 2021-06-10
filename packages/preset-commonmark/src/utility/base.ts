import { Node, Mark } from '@milkdown/core';
import { AnyRecord } from './types';

type CommonOptions = {
    className?: (attrs: AnyRecord) => string;
};

export abstract class CommonNode<Options = Record<string, never>> extends Node<Options & CommonOptions> {
    protected getClassName(attrs: AnyRecord, defaultValue = this.id) {
        return this.options.className?.(attrs) ?? defaultValue;
    }
}

export abstract class CommonMark<Options = Record<string, never>> extends Mark<Options & CommonOptions> {
    protected getClassName(attrs: AnyRecord, defaultValue = this.id) {
        return this.options.className?.(attrs) ?? defaultValue;
    }
}
