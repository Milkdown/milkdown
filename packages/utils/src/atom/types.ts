import type { NodeViewFactory, MarkViewFactory } from '@milkdown/core';
import type { NodeType, MarkType, Schema } from 'prosemirror-model';
import type { Command } from 'prosemirror-commands';
import type { AnyRecord } from '../type-utility';

export type CommandConfig = {
    command: Command;
    defaultKey: parserCtx;
};

export type Commands<T extends parserCtx> = Record<T, CommandConfig>;
export type UserKeymap<T extends parserCtx> = Partial<Record<T, parserCtx | parserCtx[]>>;

export interface NodeOptional<T extends parserCtx> {
    readonly commands?: (nodeType: NodeType, schema: Schema) => Commands<T>;
}

export interface MarkOptional<T extends parserCtx> {
    readonly commands?: (nodeType: MarkType, schema: Schema) => Commands<T>;
}

export type CommonOptions<SupportedKeys extends parserCtx> = {
    className?: (attrs: AnyRecord) => parserCtx;
    keymap?: Partial<Record<SupportedKeys, parserCtx | parserCtx[]>>;
};

export type NodeOptions<SupportedKeys extends parserCtx, T> = T &
    CommonOptions<SupportedKeys> & {
        readonly view?: NodeViewFactory;
    };

export type MarkOptions<SupportedKeys extends parserCtx, T> = T &
    CommonOptions<SupportedKeys> & {
        readonly view?: MarkViewFactory;
    };
