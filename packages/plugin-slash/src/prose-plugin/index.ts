/* Copyright 2021, Milkdown by Mirone. */
import { EditorState, NodeWithPos, Plugin, PluginKey } from '@milkdown/prose';
import { Utils } from '@milkdown/utils';

import { transformAction, WrappedAction } from '../item';
import { createProps } from './props';
import { createStatus, CursorStatus } from './status';
import { createView } from './view';

export const key = 'MILKDOWN_PLUGIN_SLASH';

export const createSlashPlugin = (
    utils: Utils,
    items: WrappedAction[],
    placeholder: Record<CursorStatus, string>,
    shouldDisplay: (parent: NodeWithPos, state: EditorState) => boolean,
) => {
    const status = createStatus();
    const actions = items.map(transformAction);

    return new Plugin({
        key: new PluginKey(key),
        props: createProps(status, utils, placeholder, shouldDisplay),
        view: (view) => createView(status, actions, view, utils),
    });
};
