import type { NodeType, MarkType, Schema } from 'prosemirror-model';
import type { Command, Keymap } from 'prosemirror-commands';
import type { Shortcuts, CommandConfig, UserKeymap } from './types';
import type { CommandKey } from '@milkdown/core';

type KeymapTuple = [shortcut: string, command: Command];
type KeymapConfigTuple<T extends string> = [key: T, config: CommandConfig];

const commands2Tuples = <K extends string>(commands: Shortcuts<K>): Array<KeymapConfigTuple<K>> =>
    Object.entries(commands).filter((x): x is KeymapConfigTuple<K> => !!x);

const getShortCuts = <SupportedKeys extends string>(
    name: SupportedKeys,
    defaultKey: string,
    userKeymap?: UserKeymap<SupportedKeys>,
): string | string[] => userKeymap?.[name] ?? defaultKey;

const getKeymap =
    <K extends string>(getCommand: (key: CommandKey) => Command, userKeymap?: UserKeymap<K>) =>
    ([name, { defaultKey, commandKey }]: KeymapConfigTuple<K>): Array<KeymapTuple> =>
        [getShortCuts(name, defaultKey, userKeymap)].flat().map((shortcut) => [shortcut, getCommand(commandKey)]);

const tuple2Keymap = <K extends string>(
    tuples: Array<KeymapConfigTuple<K>>,
    getCommand: (key: CommandKey) => Command,
    userKeymap?: UserKeymap<K>,
): KeymapTuple[] => tuples.flatMap(getKeymap(getCommand, userKeymap));

export const createKeymap = <SupportedKeys extends string, Type extends NodeType | MarkType>(
    commands?: Shortcuts<SupportedKeys>,
    userKeymap?: UserKeymap<SupportedKeys>,
): ((type: Type, schema: Schema, getCommand: (key: CommandKey) => Command) => Keymap) =>
    // !commands
    //     ? () => ({})
    //     : (_type, _schema, getCommand) =>
    //           flow(commands2Tuples, curryRight(tuple2Keymap)(userKeymap, getCommand), Object.fromEntries);
    !commands
        ? () => ({})
        : (_type, _schema, getCommand) =>
              Object.fromEntries(tuple2Keymap(commands2Tuples(commands), getCommand, userKeymap));
