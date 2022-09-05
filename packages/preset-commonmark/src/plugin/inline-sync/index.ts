/* Copyright 2021, Milkdown by Mirone. */
import { Ctx, editorViewCtx } from '@milkdown/core';
import { Plugin, PluginKey } from '@milkdown/prose/state';

import { inlineSyncConfigCtx } from './config';
import { getContextByState } from './context';
import { runReplacer } from './replacer';

export * from './config';

export const inlineSyncPluginKey = new PluginKey('MILKDOWN_INLINE_SYNC');
export const getInlineSyncPlugin = (ctx: Ctx) => {
    const inlineSyncPlugin = new Plugin<null>({
        key: inlineSyncPluginKey,
        state: {
            init: () => {
                return null;
            },
            apply: (tr, _value, _oldState, newState) => {
                if (!tr.docChanged) return null;

                const meta = tr.getMeta(inlineSyncPluginKey);
                if (meta) {
                    return null;
                }

                const context = getContextByState(ctx, newState);
                if (!context) return null;

                const { prevNode, nextNode, text } = context;

                const { shouldSyncNode } = ctx.get(inlineSyncConfigCtx);

                if (!shouldSyncNode({ prevNode, nextNode, ctx, tr, text })) return null;

                requestAnimationFrame(() => {
                    const { dispatch, state } = ctx.get(editorViewCtx);

                    runReplacer(ctx, inlineSyncPluginKey, state, dispatch, prevNode.attrs);
                });

                return null;
            },
        },
    });

    return inlineSyncPlugin;
};
