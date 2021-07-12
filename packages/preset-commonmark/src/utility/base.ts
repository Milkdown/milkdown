import { Node, Mark, NodeViewFactory, MarkViewFactory } from '@milkdown/core';
import { NodeType, MarkType } from 'prosemirror-model';
import { Command, Keymap } from 'prosemirror-commands';
import { AnyRecord } from './types';

type Empty = Record<string, unknown>;

type CommonOptions<SupportedKeys extends string> = {
    className?: (attrs: AnyRecord) => string;
    keymap?: Partial<Record<SupportedKeys, string | string[]>>;
};

type CommandValue = {
    command: Command;
    defaultKey: string;
};

type Commands<T extends string> = Record<T, CommandValue>;

interface NodeOptional<T extends string> {
    readonly commands?: (nodeType: NodeType) => Commands<T>;
}

interface MarkOptional<T extends string> {
    readonly commands?: (nodeType: MarkType) => Commands<T>;
}

type NodeOptions = {
    readonly view?: NodeViewFactory;
};

type MarkOptions = {
    readonly view?: MarkViewFactory;
};

export abstract class BaseNode<SupportedKeys extends string = string, Options = Empty>
    extends Node<Options & CommonOptions<SupportedKeys> & NodeOptions>
    implements NodeOptional<SupportedKeys>
{
    commands?: NodeOptional<SupportedKeys>['commands'];

    override readonly keymap = (nodeType: NodeType): Keymap => {
        const { commands } = this;
        if (!commands) return {};

        const map = commands(nodeType);
        const entries = Object.entries(map) as Array<[SupportedKeys, CommandValue]>;

        return entries.reduce(
            (acc: Record<string, Command>, [key, { command, defaultKey }]) => ({
                ...acc,
                ...this.getKeymap(key, defaultKey, command),
            }),
            {} as Record<string, Command>,
        );
    };

    protected getKeymap(key: SupportedKeys, defaultKey: string, command: Command): Record<string, Command> {
        const { keymap } = this.options;
        if (!keymap) return { [defaultKey]: command };
        const value: string | string[] | undefined = keymap[key];
        if (!value) return { [defaultKey]: command };
        if (Array.isArray(value)) {
            return value.reduce(
                (acc, cur) => ({
                    ...acc,
                    [cur]: command,
                }),
                {} as Record<string, Command>,
            );
        }
        return { [value]: command };
    }

    protected getClassName(attrs: AnyRecord, defaultValue = this.id) {
        return this.options.className?.(attrs) ?? defaultValue;
    }

    override readonly view?: NodeViewFactory = this.options.view;
}

export abstract class BaseMark<SupportedKeys extends string = never, Options = Empty>
    extends Mark<Options & CommonOptions<SupportedKeys> & MarkOptions>
    implements MarkOptional<SupportedKeys>
{
    commands?: MarkOptional<SupportedKeys>['commands'];
    protected getClassName(attrs: AnyRecord, defaultValue = this.id) {
        return this.options.className?.(attrs) ?? defaultValue;
    }
    override readonly view?: MarkViewFactory = this.options.view;

    override readonly keymap = (markType: MarkType): Keymap => {
        const { commands } = this;
        if (!commands) return {};

        const map = commands(markType);
        const entries = Object.entries(map) as Array<[SupportedKeys, CommandValue]>;

        return entries.reduce(
            (acc: Record<string, Command>, [key, { command, defaultKey }]) => ({
                ...acc,
                ...this.getKeymap(key, defaultKey, command),
            }),
            {} as Record<string, Command>,
        );
    };

    protected getKeymap(key: SupportedKeys, defaultKey: string, command: Command): Record<string, Command> {
        const { keymap } = this.options;
        if (!keymap) return { [defaultKey]: command };
        const value: string | string[] | undefined = keymap[key];
        if (!value) return { [defaultKey]: command };
        if (Array.isArray(value)) {
            return value.reduce(
                (acc, cur) => ({
                    ...acc,
                    [cur]: command,
                }),
                {} as Record<string, Command>,
            );
        }
        return { [value]: command };
    }
}
