/* Copyright 2021, Milkdown by Mirone. */

import { commandsCtx, Ctx, editorViewCtx, Icon } from '@milkdown/core';
import { getNodeFromSchema } from '@milkdown/prose';
import { setBlockType, wrapIn } from '@milkdown/prose/commands';

import { ActiveNode } from './select-node-by-dom';

export type BlockAction = {
    id: string;
    icon: Icon | HTMLElement;
    content: string;
    command: (ctx: Ctx, active: ActiveNode) => void;
    disabled: (ctx: Ctx, active: ActiveNode) => boolean;
};

export type ConfigBuilder = (ctx: Ctx) => BlockAction[];

export const defaultConfigBuilder: ConfigBuilder = () => {
    return [
        {
            id: 'text',
            icon: 'text',
            content: 'Text',
            command: (ctx) => {
                return ctx.get(commandsCtx).call('TurnIntoHeading', 0);
            },
            disabled: (_, active) => !active.node.type.isTextblock,
        },
        {
            id: 'h1',
            icon: 'h1',
            content: 'Heading 1',
            command: (ctx) => ctx.get(commandsCtx).call('TurnIntoHeading', 1),
            disabled: (_, active) => !active.node.type.isTextblock,
        },
        {
            id: 'h2',
            icon: 'h2',
            content: 'Heading 2',
            command: (ctx) => ctx.get(commandsCtx).call('TurnIntoHeading', 2),
            disabled: (_, active) => !active.node.type.isTextblock,
        },
        {
            id: 'h3',
            icon: 'h3',
            content: 'Heading 3',
            command: (ctx) => ctx.get(commandsCtx).call('TurnIntoHeading', 3),
            disabled: (_, active) => !active.node.type.isTextblock,
        },
        {
            id: 'bullet_list',
            icon: 'bulletList',
            content: 'Bullet list',
            command: (ctx) => ctx.get(commandsCtx).call('WrapInBulletList'),
            disabled: (ctx) => {
                const view = ctx.get(editorViewCtx);
                const node = getNodeFromSchema('bullet_list', view.state.schema);
                return !wrapIn(node)(view.state);
            },
        },
        {
            id: 'ordered_list',
            icon: 'orderedList',
            content: 'Ordered list',
            command: (ctx) => ctx.get(commandsCtx).call('WrapInOrderedList'),
            disabled: (ctx) => {
                const view = ctx.get(editorViewCtx);
                const node = getNodeFromSchema('ordered_list', view.state.schema);
                return !wrapIn(node)(view.state);
            },
        },
        {
            id: 'task_list',
            icon: 'taskList',
            content: 'Task list',
            command: (ctx) => ctx.get(commandsCtx).call('TurnIntoTaskList'),
            disabled: (ctx) => {
                const view = ctx.get(editorViewCtx);
                const node = getNodeFromSchema('task_list_item', view.state.schema);
                return !wrapIn(node)(view.state);
            },
        },
        {
            id: 'blockquote',
            icon: 'quote',
            content: 'Blockquote',
            command: (ctx) => ctx.get(commandsCtx).call('WrapInBlockquote'),
            disabled: (ctx) => {
                const view = ctx.get(editorViewCtx);
                const node = getNodeFromSchema('blockquote', view.state.schema);
                return !wrapIn(node)(view.state);
            },
        },
        {
            id: 'code_fence',
            icon: 'code',
            content: 'Code',
            command: (ctx) => ctx.get(commandsCtx).call('TurnIntoCodeFence'),
            disabled: (ctx) => {
                const view = ctx.get(editorViewCtx);
                const node = getNodeFromSchema('fence', view.state.schema);
                return !setBlockType(node)(view.state);
            },
        },
    ];
};
