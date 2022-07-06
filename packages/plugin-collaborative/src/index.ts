/* Copyright 2021, Milkdown by Mirone. */
import {
    createSlice,
    createTimer,
    EditorViewReady,
    emotionCtx,
    MilkdownPlugin,
    themeManagerCtx,
    ThemeReady,
} from '@milkdown/core';

import { CollabService } from './collab-service';
import { injectStyle } from './injectStyle';

export const collabServiceCtx = createSlice(new CollabService(), 'collabServiceCtx');
export const CollabReady = createTimer('CollabReady');

export const collaborative: MilkdownPlugin = (pre) => {
    const collabService = new CollabService();
    pre.inject(collabServiceCtx, collabService).record(CollabReady);
    return async (ctx) => {
        await ctx.wait(ThemeReady);
        const themeManager = ctx.get(themeManagerCtx);
        const emotion = ctx.get(emotionCtx);
        themeManager.onFlush(() => {
            injectStyle(themeManager, emotion);
        });

        await ctx.wait(EditorViewReady);
        collabService.bindCtx(ctx);
        ctx.done(CollabReady);
    };
};

export { CollabService } from './collab-service';
export * from 'y-prosemirror';
