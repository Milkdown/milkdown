/* Copyright 2021, Milkdown by Mirone. */
import { Mark, markFactory } from '@milkdown/core';

import { AtomOptional, Factory, Options, Origin, PluginWithMetadata, UnknownRecord, Utils } from '../types';
import { commonPlugin } from './common';
import { createKeymap } from './keymap';

export const createMark = <SupportedKeys extends string = string, T extends UnknownRecord = UnknownRecord>(
    factory: Factory<SupportedKeys, T, Mark>,
): Origin<SupportedKeys, T, Mark> => {
    const origin: Origin<SupportedKeys, T, Mark> = (options) => {
        const plugin = markFactory((ctx) => {
            const mark = commonPlugin(factory, ctx, options);
            const view = options?.view ?? mark.view;
            const keymap = createKeymap(mark.shortcuts, options?.keymap);
            plugin.id = mark.id;

            return {
                ...mark,
                view,
                keymap,
            };
        }) as PluginWithMetadata<SupportedKeys, T, Mark>;
        plugin.origin = origin;

        return plugin;
    };
    origin.extend = <SupportedKeysExtended extends SupportedKeys = SupportedKeys, ObjExtended extends T = T>(
        extendFactory: (
            options: Options<SupportedKeysExtended, ObjExtended, Mark> | undefined,
            utils: Utils,
            original: Mark & AtomOptional<SupportedKeys>,
        ) => Mark & AtomOptional<SupportedKeysExtended>,
    ) => {
        return createMark<SupportedKeysExtended, ObjExtended>((options, utils) => {
            const original = factory(options as T, utils);
            const extended = extendFactory(options, utils, original);
            return extended;
        });
    };

    return origin;
};
