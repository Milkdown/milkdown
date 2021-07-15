import { Node, NodeViewFactory } from '@milkdown/core';
import type { AnyRecord, UnknownRecord } from '../type-utility';
import { createKeymap } from './keymap';
import type { NodeOptional, NodeOptions } from './types';

export abstract class BaseNode<SupportedKeys extends string = string, Options = UnknownRecord>
    extends Node<NodeOptions<SupportedKeys, Options>>
    implements NodeOptional<SupportedKeys>
{
    commands?: NodeOptional<SupportedKeys>['commands'];

    protected getClassName = (attrs: AnyRecord, defaultValue = this.id) =>
        this.options.className?.(attrs) ?? defaultValue;

    override readonly keymap: Node['keymap'] = (type, schema) =>
        createKeymap(this.commands, this.options.keymap)(type, schema);

    override readonly view?: NodeViewFactory = this.options.view;
}
