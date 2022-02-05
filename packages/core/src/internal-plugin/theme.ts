/* Copyright 2021, Milkdown by Mirone. */
import { createContainer, createSlice, createTimer, MilkdownPlugin, Slice, Timer } from '@milkdown/ctx';
import { Emotion, init, injectVar, Options, pack2Tool, ThemePack, ThemeTool } from '@milkdown/design-system';
import { Plugin, PluginKey } from '@milkdown/prose';

import { ConfigReady, InitReady, prosePluginsCtx } from '.';

export const themeToolCtx = createSlice<ThemeTool>(
    {
        mixin: {} as never,
        font: {} as never,
        size: {} as never,
        slots: {} as never,
        palette: () => '',
    },
    'ThemeTool',
);
export const emotionConfigCtx = createSlice<Options>({ key: 'milkdown' }, 'EmotionConfig');
export const emotionCtx = createSlice<Emotion>({} as Emotion, 'Emotion');

export type ThemeProvider<T = undefined> = (themeTool: ThemeTool, info?: T) => string | void;
export type ThemeProviderKey<T = undefined> = Slice<ThemeProvider<T>>;

export const createThemeProviderKey = <T = undefined>(key = 'themeComponentKey'): ThemeProviderKey<T> =>
    createSlice((() => '') as ThemeProvider<T>, key);

export type ThemeManager = {
    provide: <T>(meta: ThemeProviderKey<T>, value: ThemeProvider<T>) => void;
    consume: <T>(meta: ThemeProviderKey<T> | string, info?: T) => ReturnType<ThemeProvider<T>>;
};

export const themeManagerCtx = createSlice<ThemeManager>({} as ThemeManager, 'themeManager');

export type { Emotion, ThemeTool } from '@milkdown/design-system';

export const themeTimerCtx = createSlice<Timer[]>([], 'themeTimer');
export const ThemeReady = createTimer('ThemeReady');
const key = new PluginKey('MILKDOWN_THEME_RESET');

export const themeFactory =
    (createThemePack: (emotion: Emotion) => ThemePack): MilkdownPlugin =>
    (pre) => {
        const container = createContainer();
        const themeManager: ThemeManager = {
            provide: (slice, value) => slice(container.sliceMap, value),
            consume: () => {
                // cannot called here,
                throw new Error();
            },
        };

        pre.inject(themeToolCtx)
            .inject(emotionConfigCtx)
            .inject(emotionCtx)
            .inject(themeManagerCtx, themeManager)
            .inject(themeTimerCtx, [ConfigReady])
            .record(ThemeReady);

        return async (ctx) => {
            await ctx.waitTimers(themeTimerCtx);
            const emotion = init(ctx.get(emotionConfigCtx));
            const themePack = createThemePack(emotion);

            injectVar(themePack, emotion);
            const tool = pack2Tool(themePack);

            ctx.set(emotionCtx, emotion);
            ctx.set(themeToolCtx, tool);
            ctx.update(themeManagerCtx, (prev) => ({
                ...prev,
                consume: (slice, info) => {
                    const meta =
                        typeof slice === 'string' ? container.getSliceByName(slice) : container.getSlice(slice);
                    if (!meta) return;

                    return (meta.get() as ThemeProvider<unknown>)(tool, info);
                },
            }));
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
