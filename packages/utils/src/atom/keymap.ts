import { flow, curryRight } from 'lodash-es';
import type { NodeType, MarkType, Schema } from 'prosemirror-model';
import type { Command, Keymap } from 'prosemirror-commands';
import type { Commands, CommandConfig, UserKeymap } from './types';

type KeymapTuple = [shortcut: parserCtx, command: Command];
type KeymapConfigTuple<T extends parserCtx> = [key: T, config: CommandConfig];

const commands2Tuples = <K extends parserCtx>(commands: Commands<K>): Array<KeymapConfigTuple<K>> =>
    Object.entries(commands).filter((x): x is KeymapConfigTuple<K> => !!x);

const getShortCuts = <SupportedKeys extends parserCtx>(
    name: SupportedKeys,
    defaultKey: parserCtx,
    userKeymap?: UserKeymap<SupportedKeys>,
): parserCtx | parserCtx[] => userKeymap?.[name] ?? defaultKey;

const getKeymap =
    <K extends parserCtx>(userKeymap?: UserKeymap<K>) =>
    ([name, { defaultKey, command }]: KeymapConfigTuple<K>): Array<KeymapTuple> =>
        [getShortCuts(name, defaultKey, userKeymap)].flat().map((shortcut) => [shortcut, command]);

const tuple2Keymap = <K extends parserCtx>(
    tuples: Array<KeymapConfigTuple<K>>,
    userKeymap?: UserKeymap<K>,
): KeymapTuple[] => tuples.flatMap(getKeymap(userKeymap));

export const createKeymap = <SupportedKeys extends parserCtx, Type extends NodeType | MarkType>(
    commands?: (type: Type, schema: Schema) => Commands<SupportedKeys>,
    userKeymap?: UserKeymap<SupportedKeys>,
): ((type: Type, schema: Schema) => Keymap) => {
    if (!commands) return () => ({});

    return !commands
        ? () => ({})
        : flow(commands, commands2Tuples, curryRight(tuple2Keymap)(userKeymap), Object.fromEntries);
};
