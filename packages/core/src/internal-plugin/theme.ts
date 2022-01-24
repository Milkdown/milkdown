/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, MilkdownPlugin } from '@milkdown/ctx';
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

export type { Emotion, ThemeTool } from '@milkdown/design-system';

const key = new PluginKey('MILKDOWN_THEME_RESET');

export const themeFactory =
    (createThemePack: (emotion: Emotion) => ThemePack): MilkdownPlugin =>
    (pre) => {
        pre.inject(themeToolCtx).inject(emotionConfigCtx).inject(emotionCtx);
        return async (ctx) => {
            await ctx.wait(ConfigReady);
            const emotion = init(ctx.get(emotionConfigCtx));
            const themePack = createThemePack(emotion);

            injectVar(themePack, emotion);
            const tool = pack2Tool(themePack);

            ctx.set(emotionCtx, emotion);
            ctx.set(themeToolCtx, tool);

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
