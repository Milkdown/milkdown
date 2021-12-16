/* Copyright 2021, Milkdown by Mirone. */

import { Icon, ThemePack } from '@milkdown/design-system';

type Slot = {
    icon: string;
    label: string;
};

const iconMapping: Record<Icon, Slot> = {
    h1: {
        label: 'h1',
        icon: 'looks_one',
    },
    h2: {
        label: 'h2',
        icon: 'looks_two',
    },
    h3: {
        label: 'h3',
        icon: 'looks_3',
    },
    loading: {
        label: 'loading',
        icon: 'hourglass_empty',
    },
    quote: {
        label: 'quote',
        icon: 'format_quote',
    },
    code: {
        label: 'code',
        icon: 'code',
    },
    table: {
        label: 'table',
        icon: 'table_chart',
    },
    divider: {
        label: 'divider',
        icon: 'horizontal_rule',
    },
    image: {
        label: 'image',
        icon: 'image',
    },
    brokenImage: {
        label: 'broken image',
        icon: 'broken_image',
    },
    bulletList: {
        label: 'bullet list',
        icon: 'format_list_bulleted',
    },
    orderedList: {
        label: 'ordered list',
        icon: 'format_list_numbered',
    },
    taskList: {
        label: 'task list',
        icon: 'checklist',
    },
    bold: {
        label: 'bold',
        icon: 'format_bold',
    },
    italic: {
        label: 'italic',
        icon: 'format_italic',
    },
    inlineCode: {
        label: 'inline code',
        icon: 'code',
    },
    strikeThrough: {
        label: 'strike through',
        icon: 'strikethrough_s',
    },
    link: {
        label: 'link',
        icon: 'link',
    },
    leftArrow: {
        label: 'left arrow',
        icon: 'chevron_left',
    },
    rightArrow: {
        label: 'right arrow',
        icon: 'chevron_right',
    },
    upArrow: {
        label: 'up arrow',
        icon: 'expand_less',
    },
    downArrow: {
        label: 'down arrow',
        icon: 'expand_more',
    },
    alignLeft: {
        label: 'align left',
        icon: 'format_align_left',
    },
    alignRight: {
        label: 'align right',
        icon: 'format_align_right',
    },
    alignCenter: {
        label: 'align center',
        icon: 'format_align_center',
    },
    delete: {
        label: 'delete',
        icon: 'delete',
    },
    select: {
        label: 'select',
        icon: 'select_all',
    },
    unchecked: {
        label: 'unchecked',
        icon: 'check_box_outline_blank',
    },
    checked: {
        label: 'checked',
        icon: 'check_box',
    },
    undo: {
        label: 'undo',
        icon: 'turn_left',
    },
    redo: {
        label: 'redo',
        icon: 'turn_right',
    },
    liftList: {
        label: 'lift list',
        icon: 'format_indent_decrease',
    },
    sinkList: {
        label: 'sink list',
        icon: 'format_indent_increase',
    },
};

export const slots: ThemePack['slots'] = () => ({
    icon: (id) => {
        const span = document.createElement('span');
        span.className = 'icon material-icons material-icons-outlined';
        span.textContent = iconMapping[id].icon;
        return span;
    },
    label: (id) => {
        return iconMapping[id].label;
    },
});
