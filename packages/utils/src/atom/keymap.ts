import type { NodeType, MarkType, Schema } from 'prosemirror-model';
import type { Command, Keymap } from 'prosemirror-commands';
import type { Shortcuts, CommandConfig, UserKeymap } from './types';
import type { Cmd, CmdKey } from '@milkdown/core';

type KeymapTuple = [shortcut: string, command: Command];
type KeymapConfigTuple<T extends string, U> = [key: T, config: CommandConfig<U>];

const commands2Tuples = <K extends string, U>(commands: Shortcuts<K>): Array<KeymapConfigTuple<K, U>> =>
    Object.entries(commands).filter((x): x is KeymapConfigTuple<K, U> => !!x);

const getShortCuts = <SupportedKeys extends string>(
    name: SupportedKeys,
    defaultKey: string,
    userKeymap?: UserKeymap<SupportedKeys>,
): string | string[] => userKeymap?.[name] ?? defaultKey;

const getKeymap =
    <K extends string, U>(getCommand: (key: CmdKey<U>) => Cmd<U>, userKeymap?: UserKeymap<K>) =>
    ([name, { defaultKey, commandKey, args }]: KeymapConfigTuple<K, U>): Array<KeymapTuple> =>
        [getShortCuts(name, defaultKey, userKeymap)].flat().map((shortcut) => [shortcut, getCommand(commandKey)(args)]);

const tuple2Keymap = <K extends string, U>(
    tuples: Array<KeymapConfigTuple<K, U>>,
    getCommand: (key: CmdKey<U>) => Cmd<U>,
    userKeymap?: UserKeymap<K>,
): KeymapTuple[] => tuples.flatMap(getKeymap(getCommand, userKeymap));

export const createKeymap = <SupportedKeys extends string, Type extends NodeType | MarkType, U>(
    commands?: Shortcuts<SupportedKeys>,
    userKeymap?: UserKeymap<SupportedKeys>,
): ((type: Type, schema: Schema, getCommand: (key: CmdKey<U>) => Cmd<U>) => Keymap) =>
    !commands
        ? () => ({})
        : (_type, _schema, getCommand) =>
              Object.fromEntries(tuple2Keymap(commands2Tuples<SupportedKeys, U>(commands), getCommand, userKeymap));
