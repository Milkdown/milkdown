import { toggleMark } from 'prosemirror-commands';
import type { MarkType } from 'prosemirror-model';
import type { ButtonItem } from '../item';
import { icon } from './element';
import { hasMark, isTextAndNotHasMark } from './prosemirror';

export const createToggleIcon = (
    iconName: string,
    mark: MarkType,
    disableForMark: MarkType,
    attrs?: Record<string, unknown>,
): ButtonItem => ({
    $: icon(iconName),
    command: () => toggleMark(mark, attrs),
    active: (view) => hasMark(view.state, mark),
    disable: (view) => isTextAndNotHasMark(view.state, disableForMark),
    enable: (view) => !!mark && !!view.state.schema.marks[mark.name],
});
