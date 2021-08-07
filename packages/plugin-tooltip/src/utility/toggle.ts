import { CmdKey, commandsCtx, Ctx } from '@milkdown/core';
import type { MarkType } from 'prosemirror-model';
import type { ButtonItem } from '../item';
import { icon } from './element';
import { hasMark, isTextAndNotHasMark } from './prosemirror';

export const createToggleIcon = <T>(
    ctx: Ctx,
    iconName: string,
    commandKey: CmdKey<T>,
    mark: MarkType,
    disableForMark: MarkType,
): ButtonItem => ({
    $: icon(iconName),
    command: () => ctx.get(commandsCtx).get(commandKey)(),
    active: (view) => hasMark(view.state, mark),
    disable: (view) => isTextAndNotHasMark(view.state, disableForMark),
    enable: (view) => !!mark && !!view.state.schema.marks[mark.name],
});
