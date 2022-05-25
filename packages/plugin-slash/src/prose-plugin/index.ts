/* Copyright 2021, Milkdown by Mirone. */
import { Plugin, PluginKey } from '@milkdown/prose/state';
import { Utils } from '@milkdown/utils';

import type { StatusConfigBuilder } from '..';
import { createProps } from './props';
import { createStatus } from './status';
import { createView } from './view';

export const key = 'MILKDOWN_SLASH';

export const createSlashPlugin = (utils: Utils, builder: StatusConfigBuilder, className: string) => {
    const status = createStatus(builder);

    return new Plugin({
        key: new PluginKey(key),
        props: createProps(status, utils),
        view: (view) => createView(status, view, utils, className),
    });
};
