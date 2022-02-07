/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, createTimer, MilkdownPlugin, Timer } from '@milkdown/ctx';
import {
    createThemeManager,
    Emotion,
    emotionConfigCtx,
    emotionCtx,
    initEmotion,
    internalThemeKeys,
    ThemeGlobal,
    ThemeManager,
    themeManagerCtx,
    ThemeSliceKey,
} from '@milkdown/design-system';
import { Plugin, PluginKey } from '@milkdown/prose';

import { ConfigReady } from './config';
import { InitReady, prosePluginsCtx } from './init';

export const themeTimerCtx = createSlice<Timer[]>([], 'themeTimer');
export const ThemeReady = createTimer('ThemeReady');

const key = new PluginKey('MILKDOWN_THEME_RESET');

export const themeFactory =
    (createThemePack: (emotion: Emotion, manager: ThemeManager) => void): MilkdownPlugin =>
    (pre) => {
        const themeManager = createThemeManager();

        pre.inject(emotionConfigCtx)
            .inject(emotionCtx)
            .inject(themeManagerCtx, themeManager)
            .inject(themeTimerCtx, [ConfigReady])
            .record(ThemeReady);

        return async (ctx) => {
            await ctx.waitTimers(themeTimerCtx);
            const emotion = initEmotion(ctx.get(emotionConfigCtx));

            internalThemeKeys.forEach((key) => {
                themeManager.inject(key as ThemeSliceKey);
            });

            createThemePack(emotion, themeManager);

            ctx.set(emotionCtx, emotion);
            themeManager.get(ThemeGlobal);

            ctx.done(ThemeReady);

            await ctx.wait(InitReady);
            ctx.update(prosePluginsCtx, (xs) =>
                xs.concat(
                    new Plugin({
                        key,
                        view: () => ({
                            destroy: () => {
                                emotion.flush();
                            },
                        }),
                    }),
                ),
            );
        };
    };

export * from '@milkdown/design-system';
