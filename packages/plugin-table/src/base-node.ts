import { Node, NodeViewFactory } from '@milkdown/core';
import { Command, Keymap } from 'prosemirror-commands';
import { NodeType, Schema } from 'prosemirror-model';

type Empty = Record<string, unknown>;

type CommonOptions<SupportedKeys extends string> = {
    keymap?: Partial<Record<SupportedKeys, string | string[]>>;
};

type CommandValue = {
    command: Command;
    defaultKey: string;
};

type Commands<T extends string> = Record<T, CommandValue>;

interface NodeOptional<T extends string> {
    readonly commands?: (nodeType: NodeType, schema: Schema) => Commands<T>;
}

type NodeOptions = {
    readonly view?: NodeViewFactory;
};

export abstract class BaseNode<SupportedKeys extends string = string, Options = Empty>
    extends Node<Options & CommonOptions<SupportedKeys> & NodeOptions>
    implements NodeOptional<SupportedKeys>
{
    commands?: NodeOptional<SupportedKeys>['commands'];

    override readonly keymap = (nodeType: NodeType, schema: Schema): Keymap => {
        const { commands } = this;
        if (!commands) return {};

        const map = commands(nodeType, schema);
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

    override readonly view?: NodeViewFactory = this.options.view;
}
