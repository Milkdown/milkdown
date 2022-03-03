/* Copyright 2021, Milkdown by Mirone. */
import {
    createThemeSliceKey,
    Emotion,
    getPalette,
    ThemeBorder,
    ThemeManager,
    ThemeShadow,
    ThemeSize,
} from '@milkdown/core';
import { calculateTextPosition, EditorView } from '@milkdown/prose';

type InputChipRenderer = {
    dom: HTMLElement;
    init: (editorView: EditorView) => void;
    show: (editorView: EditorView) => void;
    hide: () => void;
    destroy: () => void;
};

type InputChipOptions = {
    isBindMode: boolean;
    buttonText?: string;
    onUpdate: (value: string) => void;
};

export const ThemeInputChip = createThemeSliceKey<InputChipRenderer, InputChipOptions, 'input-chip'>('input-chip');
export type ThemeInputChipType = typeof ThemeInputChip;

const getStyle = (manager: ThemeManager, { css }: Emotion) => {
    const palette = getPalette(manager);
    return css`
        ${manager.get(ThemeBorder, undefined)}
        ${manager.get(ThemeShadow, undefined)}

        display: inline-flex;
        justify-content: space-between;
        align-items: center;
        position: absolute;
        background: ${palette('surface')};
        border-radius: ${manager.get(ThemeSize, 'radius')};
        font-size: 1em;

        height: 3.5em;
        box-sizing: border-box;
        width: 25.5em;
        padding: 0 1em;
        gap: 1em;
        z-index: 2;

        input,
        button {
            all: unset;
        }

        input {
            flex-grow: 1;
            caret-color: ${palette('primary')};
            &::placeholder {
                color: ${palette('neutral', 0.6)};
            }
        }

        button {
            cursor: pointer;
            height: 2.25em;
            color: ${palette('primary')};
            font-size: 0.875em;
            padding: 0 0.5em;
            font-weight: 500;
            letter-spacing: 1.25px;
            &:hover {
                background-color: ${palette('secondary', 0.12)};
            }
            &.disable {
                color: ${palette('neutral', 0.38)};
                cursor: not-allowed;
                &:hover {
                    background: transparent;
                }
            }
            &.hide {
                display: none;
            }
        }

        &.hide {
            display: none;
        }
    `;
};

const calcInputPos = (view: EditorView, input: HTMLDivElement) => {
    calculateTextPosition(view, input, (start, end, target, parent) => {
        const $editor = view.dom.parentElement;
        if (!$editor) {
            throw new Error();
        }

        const selectionWidth = end.left - start.left;
        let left = start.left - parent.left - (target.width - selectionWidth) / 2;
        const top = start.bottom - parent.top + 14 + $editor.scrollTop;

        if (left < 0) left = 0;

        return [top, left];
    });
};

export const inputChip = (manager: ThemeManager, emotion: Emotion) => {
    manager.setCustom(ThemeInputChip, ({ isBindMode, onUpdate, buttonText }) => {
        let button: HTMLButtonElement | null = null;
        let disabled = false;
        let value = '';
        const wrapper = document.createElement('div');
        const style = getStyle(manager, emotion);

        if (style) {
            wrapper.classList.add(style);
        }

        wrapper.classList.add('tooltip-input');

        const input = document.createElement('input');
        wrapper.appendChild(input);

        if (!isBindMode) {
            button = document.createElement('button');
            button.innerText = buttonText || 'APPLY';
            wrapper.appendChild(button);
        }
        const hide = () => {
            wrapper.classList.add('hide');
        };
        const show = (editorView: EditorView) => {
            wrapper.classList.remove('hide');
            calcInputPos(editorView, wrapper);
        };

        const onInput = (e: Event) => {
            const { target } = e;
            if (!(target instanceof HTMLInputElement)) {
                return;
            }

            value = target.value;

            if (!button) {
                onUpdate(value);
                return;
            }

            if (!value) {
                button.classList.add('disable');
                disabled = true;
                return;
            }

            button.classList.remove('disable');
            disabled = false;
        };

        const onClick = (e: MouseEvent) => {
            if (disabled) return;
            e.stopPropagation();
            onUpdate(value);
            hide();
        };

        const onKeydown = (e: KeyboardEvent) => {
            if ('key' in e && e.key === 'Enter') {
                onUpdate(value);
                hide();
            }
        };

        const destroy = () => {
            input.removeEventListener('input', onInput);
            input.removeEventListener('keydown', onKeydown);
            button?.removeEventListener('mousedown', onClick);
            wrapper.remove();
        };

        const init = (editorView: EditorView) => {
            const $editor = editorView.dom.parentElement;
            if (!$editor) throw new Error();

            input.addEventListener('input', onInput);
            input.addEventListener('keydown', onKeydown);
            button?.addEventListener('mousedown', onClick);

            $editor.appendChild(wrapper);
        };

        return {
            dom: wrapper,
            init,
            show,
            hide,
            destroy,
        };
    });
};
