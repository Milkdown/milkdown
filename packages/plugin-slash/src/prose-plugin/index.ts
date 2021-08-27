import { Ctx } from '@milkdown/core';
import { Plugin, PluginKey, PluginSpec } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { Action, transformAction, WrappedAction } from '../item';
import { createProps, Props } from './props';
import { createStatus, Status } from './status';
import { View } from './view';

class SlashPlugin implements PluginSpec {
    items: Action[];
    status: Status;
    props: Props;
    ctx: Ctx;

    constructor(ctx: Ctx, items: WrappedAction[]) {
        this.items = items.map(transformAction);
        this.status = createStatus();
        this.status.setActions(this.items);
        this.props = createProps(this.status, ctx);
        this.ctx = ctx;
    }

    key = new PluginKey('milkdown-prosemirror-slash-plugin');

    view = (editorView: EditorView) => new View(this.status, this.items, editorView, this.ctx);
}

export const slashPlugin = (ctx: Ctx, items: WrappedAction[]) => new Plugin(new SlashPlugin(ctx, items));
