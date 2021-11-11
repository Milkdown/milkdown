/* Copyright 2021, Milkdown by Mirone. */
import { commandsCtx, schemaCtx, themeToolCtx } from '@milkdown/core';
import type { Ctx } from '@milkdown/ctx';
import {
    InsertHr,
    InsertImage,
    InsertTable,
    TurnIntoCodeFence,
    TurnIntoHeading,
    TurnIntoTaskList,
    WrapInBlockquote,
    WrapInBulletList,
    WrapInOrderedList,
} from '@milkdown/preset-gfm';
import { EditorState, Node } from '@milkdown/prose';

import { WrappedAction } from './item';
import { createDropdownItem } from './utility';

export type StatusConfig = {
    placeholder?: string;
    actions?: WrappedAction[];
};

export type StatusConfigBuilderParams = {
    content: string;
    isTopLevel: boolean;
    parentNode: Node;
    state: EditorState;
};

export type StatusConfigBuilder = (params: StatusConfigBuilderParams) => StatusConfig | null | undefined;

export type Config = (ctx: Ctx) => StatusConfigBuilder;

export const defaultActions = (ctx: Ctx): WrappedAction[] => {
    const nodes = ctx.get(schemaCtx).nodes;
    const actions: WrappedAction[] = [];

    if (nodes['heading']) {
        actions.push(
            ...[
                {
                    id: 'h1',
                    dom: createDropdownItem(ctx.get(themeToolCtx), 'Large Heading', 'h1'),
                    command: () => ctx.get(commandsCtx).call(TurnIntoHeading, 1),
                    keyword: ['h1', 'large heading'],
                },
                {
                    id: 'h2',
                    dom: createDropdownItem(ctx.get(themeToolCtx), 'Medium Heading', 'h2'),
                    command: () => ctx.get(commandsCtx).call(TurnIntoHeading, 2),
                    keyword: ['h2', 'medium heading'],
                },
                {
                    id: 'h3',
                    dom: createDropdownItem(ctx.get(themeToolCtx), 'Small Heading', 'h3'),
                    command: () => ctx.get(commandsCtx).call(TurnIntoHeading, 3),
                    keyword: ['h3', 'small heading'],
                },
            ],
        );
    }

    if (nodes['bullet_list']) {
        actions.push({
            id: 'bulletList',
            dom: createDropdownItem(ctx.get(themeToolCtx), 'Bullet List', 'bulletList'),
            command: () => ctx.get(commandsCtx).call(WrapInBulletList),
            keyword: ['bullet list', 'ul'],
        });
    }

    if (nodes['ordered_list']) {
        actions.push({
            id: 'orderedList',
            dom: createDropdownItem(ctx.get(themeToolCtx), 'Ordered List', 'orderedList'),
            command: () => ctx.get(commandsCtx).call(WrapInOrderedList),
            keyword: ['ordered list', 'ol'],
        });
    }

    if (nodes['task_list_item']) {
        actions.push({
            id: 'taskList',
            dom: createDropdownItem(ctx.get(themeToolCtx), 'Task List', 'taskList'),
            command: () => ctx.get(commandsCtx).call(TurnIntoTaskList),
            keyword: ['task list', 'task'],
        });
    }

    if (nodes['image']) {
        actions.push({
            id: 'image',
            dom: createDropdownItem(ctx.get(themeToolCtx), 'Image', 'image'),
            command: () => ctx.get(commandsCtx).call(InsertImage),
            keyword: ['image'],
        });
    }

    if (nodes['blockquote']) {
        actions.push({
            id: 'blockquote',
            dom: createDropdownItem(ctx.get(themeToolCtx), 'Quote', 'quote'),
            command: () => ctx.get(commandsCtx).call(WrapInBlockquote),
            keyword: ['quote', 'blockquote'],
        });
    }

    if (nodes['table']) {
        actions.push({
            id: 'table',
            dom: createDropdownItem(ctx.get(themeToolCtx), 'Table', 'table'),
            command: () => ctx.get(commandsCtx).call(InsertTable),
            keyword: ['table'],
        });
    }

    if (nodes['fence']) {
        actions.push({
            id: 'code',
            dom: createDropdownItem(ctx.get(themeToolCtx), 'Code Fence', 'code'),
            command: () => ctx.get(commandsCtx).call(TurnIntoCodeFence),
            keyword: ['code'],
        });
    }

    if (nodes['hr']) {
        actions.push({
            id: 'divider',
            dom: createDropdownItem(ctx.get(themeToolCtx), 'Divide Line', 'divider'),
            command: () => ctx.get(commandsCtx).call(InsertHr),
            keyword: ['divider', 'hr'],
        });
    }

    return actions;
};

export const defaultConfig: Config = (ctx) => {
    const actions = defaultActions(ctx);

    return ({ content, isTopLevel }) => {
        if (!isTopLevel) return null;

        if (!content) {
            return { placeholder: 'Type / to use the slash commands...' };
        }

        if (content.startsWith('/')) {
            return content === '/'
                ? {
                      placeholder: 'Type to filter...',
                      actions,
                  }
                : {
                      actions: actions.filter(({ keyword }) =>
                          keyword.some((key) => key.includes(content.slice(1).toLocaleLowerCase())),
                      ),
                  };
        }

        return null;
    };
};
