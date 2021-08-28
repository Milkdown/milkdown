import { Ctx } from '@milkdown/core';
import { Plugin, PluginKey } from 'prosemirror-state';

import { transformAction, WrappedAction } from '../item';
import { createProps } from './props';
import { createStatus } from './status';
import { createView } from './view';

export const slashPlugin = (ctx: Ctx, items: WrappedAction[]) => {
    const status = createStatus();
    const actions = items.map(transformAction);

    return new Plugin({
        key: new PluginKey('milkdown-slash-plugin'),
        props: createProps(status, ctx),
        view: (view) => createView(status, actions, view, ctx),
    });
};
