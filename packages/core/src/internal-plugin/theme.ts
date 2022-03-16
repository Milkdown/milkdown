/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, createTimer, MilkdownPlugin, Timer } from '@milkdown/ctx';
import {
    createThemeManager,
    Emotion,
    emotionConfigCtx,
    emotionCtx,
    initEmotion,
    internalThemeKeys,
    ThemeManager,
    themeManagerCtx,
    ThemeSliceKey,
} from '@milkdown/design-system';
import { Plugin, PluginKey } from '@milkdown/prose';

import { ConfigReady } from './config';
import { InitReady, prosePluginsCtx } from './init';

export const themeTimerCtx = createSlice([] as Timer[], 'themeTimer');
export const ThemeReady = createTimer('ThemeReady');

const key = new PluginKey('MILKDOWN_THEME_RESET');

export const themeEnvironment: MilkdownPlugin = (pre) => {
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

        ctx.set(emotionCtx, emotion);

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

export const themeFactory =
    (createThemePack: (emotion: Emotion, manager: ThemeManager) => void): MilkdownPlugin =>
    () => {
        return async (ctx) => {
            await ctx.wait(ThemeReady);
            const emotion = ctx.get(emotionCtx);
            const themeManager = ctx.get(themeManagerCtx);

            createThemePack(emotion, themeManager);
        };
    };

export * from '@milkdown/design-system';
