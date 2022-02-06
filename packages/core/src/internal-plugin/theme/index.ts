/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, createTimer, MilkdownPlugin, Timer } from '@milkdown/ctx';
import { Emotion, init } from '@milkdown/design-system';
import { Plugin, PluginKey } from '@milkdown/prose';

import { ConfigReady, InitReady, prosePluginsCtx } from '..';
import { emotionConfigCtx, emotionCtx } from './emotion';
import { internalThemeKeys, ThemeGlobal } from './keys';
import { createThemeManager, ThemeManager, themeManagerCtx, ThemeSliceKey } from './manager';

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
            const emotion = init(ctx.get(emotionConfigCtx));

            internalThemeKeys.forEach((key) => {
                themeManager.inject(key as ThemeSliceKey);
            });

            createThemePack(emotion, themeManager);

            ctx.set(emotionCtx, emotion);
            ctx.done(ThemeReady);

            themeManager.get(ThemeGlobal);

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

export * from './emotion';
export * from './keys';
export * from './manager';
export * from '@milkdown/design-system';
