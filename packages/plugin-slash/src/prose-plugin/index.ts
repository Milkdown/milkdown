/* Copyright 2021, Milkdown by Mirone. */
import { Plugin, PluginKey } from '@milkdown/prose';
import { Utils } from '@milkdown/utils';

import type { StatusConfig } from '..';
import { createProps } from './props';
import { createStatus } from './status';
import { createView } from './view';

export const key = 'MILKDOWN_PLUGIN_SLASH';

export const createSlashPlugin = (utils: Utils, configurations: StatusConfig[]) => {
    const status = createStatus(configurations);

    return new Plugin({
        key: new PluginKey(key),
        props: createProps(status, utils),
        view: (view) => createView(status, view, utils),
    });
};
