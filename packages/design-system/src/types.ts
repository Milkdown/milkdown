/* Copyright 2021, Milkdown by Mirone. */
export type Color = 'neutral' | 'solid' | 'shadow' | 'primary' | 'secondary' | 'line' | 'background' | 'surface';

export type Font = 'typography' | 'code';

export type Size = 'radius' | 'lineWidth';

export type Icon =
    | 'h1'
    | 'h2'
    | 'h3'
    | 'loading'
    | 'quote'
    | 'code'
    | 'table'
    | 'divider'
    | 'image'
    | 'brokenImage'
    | 'bulletList'
    | 'orderedList'
    | 'taskList'
    | 'bold'
    | 'italic'
    | 'inlineCode'
    | 'strikeThrough'
    | 'link'
    | 'leftArrow'
    | 'rightArrow'
    | 'upArrow'
    | 'downArrow'
    | 'alignLeft'
    | 'alignRight'
    | 'alignCenter'
    | 'delete'
    | 'select'
    | 'unchecked'
    | 'checked'
    | 'undo'
    | 'redo'
    | 'liftList'
    | 'sinkList';

export type IconValue = {
    dom: HTMLElement;
    label: string;
};
