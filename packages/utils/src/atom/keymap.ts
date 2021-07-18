import { flow, curryRight } from 'lodash-es';
import type { NodeType, MarkType, Schema } from 'prosemirror-model';
import type { Command, Keymap } from 'prosemirror-commands';
import type { Commands, CommandConfig, UserKeymap } from './types';

type KeymapTuple = [shortcut: string, command: Command];
type KeymapConfigTuple<T extends string> = [key: T, config: CommandConfig];

const commands2Tuples = <K extends string>(commands: Commands<K>): Array<KeymapConfigTuple<K>> =>
    Object.entries(commands).filter((x): x is KeymapConfigTuple<K> => !!x);

const getShortCuts = <SupportedKeys extends string>(
    name: SupportedKeys,
    defaultKey: string,
    userKeymap?: UserKeymap<SupportedKeys>,
): string | string[] => userKeymap?.[name] ?? defaultKey;

const getKeymap =
    <K extends string>(userKeymap?: UserKeymap<K>) =>
    ([name, { defaultKey, command }]: KeymapConfigTuple<K>): Array<KeymapTuple> =>
        [getShortCuts(name, defaultKey, userKeymap)].flat().map((shortcut) => [shortcut, command]);

const tuple2Keymap = <K extends string>(
    tuples: Array<KeymapConfigTuple<K>>,
    userKeymap?: UserKeymap<K>,
): KeymapTuple[] => tuples.flatMap(getKeymap(userKeymap));

export const createKeymap = <SupportedKeys extends string, Type extends NodeType | MarkType>(
    commands?: (type: Type, schema: Schema) => Commands<SupportedKeys>,
    userKeymap?: UserKeymap<SupportedKeys>,
): ((type: Type, schema: Schema) => Keymap) =>
    !commands ? () => ({}) : flow(commands, commands2Tuples, curryRight(tuple2Keymap)(userKeymap), Object.fromEntries);
