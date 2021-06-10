import { Node } from '@milkdown/core';
import { AnyRecord } from './types';

type NodeOptions = {
    className?: (attrs: AnyRecord) => string;
};

export abstract class CommonMarkNode<Options = Record<string, never>> extends Node<Options & NodeOptions> {
    protected getClassName(attrs: AnyRecord, defaultValue = this.id) {
        return this.options.className?.(attrs) ?? defaultValue;
    }
}
