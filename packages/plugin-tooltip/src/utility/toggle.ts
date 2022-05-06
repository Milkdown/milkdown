/* Copyright 2021, Milkdown by Mirone. */
import { commandsCtx, Ctx, ThemeIcon, themeManagerCtx } from '@milkdown/core';
import type { Icon } from '@milkdown/design-system';
import type { MarkType } from '@milkdown/prose/model';

import type { ButtonItem } from '../item';
import { hasMark, isTextAndNotHasMark } from './prosemirror';

export const createToggleIcon = (
    ctx: Ctx,
    iconName: Icon,
    key: string,
    mark: MarkType | undefined,
    disableForMark: MarkType | undefined,
): ButtonItem => ({
    $: ctx.get(themeManagerCtx).get(ThemeIcon, iconName)?.dom as HTMLElement,
    command: () => ctx.get(commandsCtx).call(key),
    active: (view) => hasMark(view.state, mark),
    disable: (view) => isTextAndNotHasMark(view.state, disableForMark),
    enable: (view) => !!mark && !!view.state.schema.marks[mark.name],
});
