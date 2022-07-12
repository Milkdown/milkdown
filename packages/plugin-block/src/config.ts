/* Copyright 2021, Milkdown by Mirone. */

import { commandsCtx, Ctx, Icon } from '@milkdown/core';

import { ActiveNode } from './select-node-by-dom';

export type BlockAction = {
    id: string;
    icon: Icon | HTMLElement;
    content: string;
    command: (ctx: Ctx, active: ActiveNode) => void;
};

export type ConfigBuilder = (ctx: Ctx) => BlockAction[];

export const defaultConfigBuilder: ConfigBuilder = () => {
    return [
        {
            id: 'text',
            icon: 'text',
            content: 'Text',
            command: (ctx) => ctx.get(commandsCtx).call('TurnIntoHeading', 0),
        },
        {
            id: 'h1',
            icon: 'h1',
            content: 'Heading 1',
            command: (ctx) => ctx.get(commandsCtx).call('TurnIntoHeading', 1),
        },
        {
            id: 'h2',
            icon: 'h2',
            content: 'Heading 2',
            command: (ctx) => ctx.get(commandsCtx).call('TurnIntoHeading', 2),
        },
        {
            id: 'h3',
            icon: 'h3',
            content: 'Heading 3',
            command: (ctx) => ctx.get(commandsCtx).call('TurnIntoHeading', 3),
        },
        {
            id: 'bullet_list',
            icon: 'bulletList',
            content: 'Bullet list',
            command: (ctx) => ctx.get(commandsCtx).call('WrapInBulletList'),
        },
        {
            id: 'ordered_list',
            icon: 'orderedList',
            content: 'Ordered list',
            command: (ctx) => ctx.get(commandsCtx).call('WrapInOrderedList'),
        },
        {
            id: 'task_list',
            icon: 'taskList',
            content: 'Task list',
            command: (ctx) => ctx.get(commandsCtx).call('TurnIntoTaskList'),
        },
        {
            id: 'blockquote',
            icon: 'quote',
            content: 'Blockquote',
            command: (ctx) => ctx.get(commandsCtx).call('WrapInBlockquote'),
        },
        {
            id: 'code_fence',
            icon: 'code',
            content: 'Code',
            command: (ctx) => ctx.get(commandsCtx).call('TurnIntoCodeFence'),
        },
    ];
};
