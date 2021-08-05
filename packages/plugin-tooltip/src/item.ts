import type { Schema } from 'prosemirror-model';
import { Command } from 'prosemirror-commands';
import { EditorView } from 'prosemirror-view';
import {
    createToggleIcon,
    hasMark,
    modifyLink,
    findChildNode,
    modifyImage,
    updateLink,
    updateImage,
    isTextSelection,
} from './utility';

export type Pred = (view: EditorView) => boolean;
export type Updater = (view: EditorView, $: HTMLElement) => void;
export type Event2Command = (e: Event, view: EditorView) => Command;

export type ButtonItem = {
    $: HTMLElement;
    command: Event2Command;
    active: Pred;
    disable?: Pred;
    enable: Pred;
};

export type InputItem = {
    command: Event2Command;
    display: Pred;
    placeholder: string;
    update: Updater;
};

export enum ButtonAction {
    ToggleBold,
    ToggleItalic,
    ToggleStrike,
    ToggleCode,
    ToggleLink,
}

export enum InputAction {
    ModifyLink,
    ModifyImage,
}

export type ButtonMap = Record<ButtonAction, ButtonItem>;
export type InputMap = Record<InputAction, InputItem>;

export const inputMap = (schema: Schema): InputMap => {
    const { marks, nodes } = schema;
    return {
        [InputAction.ModifyLink]: {
            display: (view) => isTextSelection(view.state) && hasMark(view.state, marks.link),
            command: modifyLink(schema),
            placeholder: 'Input Web Link',
            update: updateLink(schema),
        },
        [InputAction.ModifyImage]: {
            display: (view) => Boolean(findChildNode(view.state.selection, nodes.image)),
            command: modifyImage(schema, 'src'),
            placeholder: 'Input Image Link',
            update: updateImage(schema),
        },
    };
};

export const buttonMap = (schema: Schema): ButtonMap => {
    const { marks } = schema;
    return {
        [ButtonAction.ToggleBold]: createToggleIcon('format_bold', marks.strong, marks.code_inline),
        [ButtonAction.ToggleItalic]: createToggleIcon('format_italic', marks.em, marks.code_inline),
        [ButtonAction.ToggleStrike]: createToggleIcon('strikethrough_s', marks.strike_through, marks.code_inline),
        [ButtonAction.ToggleCode]: createToggleIcon('code', marks.code_inline, marks.link),
        [ButtonAction.ToggleLink]: createToggleIcon('link', marks.link, marks.code_inline, { href: '' }),
    };
};
