/* Copyright 2021, Milkdown by Mirone. */

import { Icon, ThemePack } from '@milkdown/design-system';

const iconMapping: Record<Icon, string> = {
    h1: 'looks_one',
    h2: 'looks_two',
    h3: 'looks_3',
    loading: 'hourglass_empty',
    quote: 'format_quote',
    code: 'code',
    table: 'table_chart',
    divider: 'horizontal_rule',
    image: 'image',
    brokenImage: 'broken_image',
    bulletList: 'format_list_bulleted',
    orderedList: 'format_list_numbered',
    taskList: 'checklist',
    bold: 'format_bold',
    italic: 'format_italic',
    inlineCode: 'code',
    strikeThrough: 'strikethrough_s',
    link: 'link',
    leftArrow: 'chevron_left',
    rightArrow: 'chevron_right',
    upArrow: 'expand_less',
    downArrow: 'expand_more',
    alignLeft: 'format_align_left',
    alignRight: 'format_align_right',
    alignCenter: 'format_align_center',
    delete: 'delete',
    select: 'select_all',
    unchecked: 'check_box_outline_blank',
    checked: 'check_box',
    undo: 'turn_left',
    redo: 'turn_right',
};

export const slots: ThemePack['slots'] = () => ({
    icon: (id) => {
        const span = document.createElement('span');
        span.className = 'icon material-icons material-icons-outlined';
        span.textContent = iconMapping[id];
        return span;
    },
});
