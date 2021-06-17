import { Node, Mark, NodeViewFactory, MarkViewFactory } from '@milkdown/core';
import { AnyRecord } from './types';

type CommonOptions = {
    className?: (attrs: AnyRecord) => string;
};

type NodeOptions = {
    view?: NodeViewFactory;
};

type MarkOptions = {
    view?: MarkViewFactory;
};

export abstract class CommonNode<Options = Record<string, unknown>> extends Node<
    Options & CommonOptions & NodeOptions
> {
    protected getClassName(attrs: AnyRecord, defaultValue = this.id) {
        return this.options.className?.(attrs) ?? defaultValue;
    }

    override readonly view?: NodeViewFactory = this.options.view;
}

export abstract class CommonMark<Options = Record<string, unknown>> extends Mark<
    Options & CommonOptions & MarkOptions
> {
    protected getClassName(attrs: AnyRecord, defaultValue = this.id) {
        return this.options.className?.(attrs) ?? defaultValue;
    }
    override readonly view?: MarkViewFactory = this.options.view;
}
