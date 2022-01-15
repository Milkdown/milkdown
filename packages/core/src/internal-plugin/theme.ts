/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, MilkdownPlugin } from '@milkdown/ctx';
import { Emotion, init, injectVar, Options, pack2Tool, ThemePack, ThemeTool } from '@milkdown/design-system';

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
export const themeConfigCtx = createSlice<Options>({ key: 'milkdown' }, 'ThemeConfig');
export const emotionCtx = createSlice<Emotion>({} as Emotion, 'Emotion');

export type { Emotion, ThemeTool } from '@milkdown/design-system';

export const themeFactory =
    (createThemePack: (emotion: Emotion) => ThemePack): MilkdownPlugin =>
    (pre) => {
        pre.inject(themeToolCtx).inject(themeConfigCtx).inject(emotionCtx);
        return (ctx) => {
            const emotion = init(ctx.get(themeConfigCtx));
            const themePack = createThemePack(emotion);

            injectVar(themePack);
            const tool = pack2Tool(themePack);

            ctx.set(emotionCtx, emotion);
            ctx.set(themeToolCtx, tool);
        };
    };
