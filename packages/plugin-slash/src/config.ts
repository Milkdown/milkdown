/* Copyright 2021, Milkdown by Mirone. */
import { commandsCtx, Ctx, schemaCtx, themeManagerCtx } from '@milkdown/core';
import { Node } from '@milkdown/prose/model';
import { EditorState } from '@milkdown/prose/state';

import { WrappedAction } from './item';
import { createDropdownItem } from './utility';

type Nullable<T> = T | null | undefined;

export type StatusConfig = {
    placeholder?: Nullable<string>;
    actions?: Nullable<WrappedAction[]>;
};

export type StatusConfigBuilderParams = {
    content: string;
    isTopLevel: boolean;
    parentNode: Node;
    state: EditorState;
};

export type StatusConfigBuilder = (params: StatusConfigBuilderParams) => Nullable<StatusConfig>;

export type Config = (ctx: Ctx) => StatusConfigBuilder;

export const defaultActions = (ctx: Ctx, input = '/'): WrappedAction[] => {
    const { nodes } = ctx.get(schemaCtx);
    const actions: Array<WrappedAction & { keyword: string[]; typeName: string }> = [
        {
            id: 'h1',
            dom: createDropdownItem(ctx.get(themeManagerCtx), 'Large Heading', 'h1'),
            command: () => ctx.get(commandsCtx).call('TurnIntoHeading', 1),
            keyword: ['h1', 'large heading'],
            typeName: 'heading',
        },
        {
            id: 'h2',
            dom: createDropdownItem(ctx.get(themeManagerCtx), 'Medium Heading', 'h2'),
            command: () => ctx.get(commandsCtx).call('TurnIntoHeading', 2),
            keyword: ['h2', 'medium heading'],
            typeName: 'heading',
        },
        {
            id: 'h3',
            dom: createDropdownItem(ctx.get(themeManagerCtx), 'Small Heading', 'h3'),
            command: () => ctx.get(commandsCtx).call('TurnIntoHeading', 3),
            keyword: ['h3', 'small heading'],
            typeName: 'heading',
        },
        {
            id: 'bulletList',
            dom: createDropdownItem(ctx.get(themeManagerCtx), 'Bullet List', 'bulletList'),
            command: () => ctx.get(commandsCtx).call('WrapInBulletList'),
            keyword: ['bullet list', 'ul'],
            typeName: 'bullet_list',
        },
        {
            id: 'orderedList',
            dom: createDropdownItem(ctx.get(themeManagerCtx), 'Ordered List', 'orderedList'),
            command: () => ctx.get(commandsCtx).call('WrapInOrderedList'),
            keyword: ['ordered list', 'ol'],
            typeName: 'ordered_list',
        },
        {
            id: 'taskList',
            dom: createDropdownItem(ctx.get(themeManagerCtx), 'Task List', 'taskList'),
            command: () => ctx.get(commandsCtx).call('TurnIntoTaskList'),
            keyword: ['task list', 'task'],
            typeName: 'task_list_item',
        },
        {
            id: 'image',
            dom: createDropdownItem(ctx.get(themeManagerCtx), 'Image', 'image'),
            command: () => ctx.get(commandsCtx).call('InsertImage'),
            keyword: ['image'],
            typeName: 'image',
        },
        {
            id: 'blockquote',
            dom: createDropdownItem(ctx.get(themeManagerCtx), 'Quote', 'quote'),
            command: () => ctx.get(commandsCtx).call('WrapInBlockquote'),
            keyword: ['quote', 'blockquote'],
            typeName: 'blockquote',
        },
        {
            id: 'table',
            dom: createDropdownItem(ctx.get(themeManagerCtx), 'Table', 'table'),
            command: () => ctx.get(commandsCtx).call('InsertTable'),
            keyword: ['table'],
            typeName: 'table',
        },
        {
            id: 'code',
            dom: createDropdownItem(ctx.get(themeManagerCtx), 'Code Fence', 'code'),
            command: () => ctx.get(commandsCtx).call('TurnIntoCodeFence'),
            keyword: ['code'],
            typeName: 'fence',
        },
        {
            id: 'divider',
            dom: createDropdownItem(ctx.get(themeManagerCtx), 'Divide Line', 'divider'),
            command: () => ctx.get(commandsCtx).call('InsertHr'),
            keyword: ['divider', 'hr'],
            typeName: 'hr',
        },
    ];

    const userInput = input.slice(1).toLocaleLowerCase();

    return actions
        .filter((action) => !!nodes[action.typeName] && action.keyword.some((keyword) => keyword.includes(userInput)))
        .map(({ keyword, typeName, ...action }) => action);
};

export const defaultConfig: Config = (ctx) => {
    return ({ content, isTopLevel }) => {
        if (!isTopLevel) return null;

        if (!content) {
            return { placeholder: 'Type / to use the slash commands...' };
        }

        if (content.startsWith('/')) {
            return content === '/'
                ? {
                      placeholder: 'Type to filter...',
                      actions: defaultActions(ctx),
                  }
                : {
                      actions: defaultActions(ctx, content),
                  };
        }

        return null;
    };
};
