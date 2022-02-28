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

type InputChipRenderer = {
    dom: {
        wrapper: HTMLDivElement;
        input: HTMLInputElement;
        button: HTMLButtonElement | null;
    };
};

type InputChipOptions = {
    isBindMode: boolean;
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

export const inputChip = (manager: ThemeManager, emotion: Emotion) => {
    manager.setCustom(ThemeInputChip, ({ isBindMode }) => {
        let button: HTMLButtonElement | null = null;
        const wrapper = document.createElement('div');
        const style = getStyle(manager, emotion);

        if (style) {
            wrapper.classList.add(style);
        }

        wrapper.classList.add('tooltip-input');

        const input = document.createElement('input');
        wrapper.appendChild(input);

        if (isBindMode) {
            button = document.createElement('button');
            wrapper.appendChild(button);
        }

        input.addEventListener('input', (e) => {
            const { target } = e;
            if (!(target instanceof HTMLInputElement)) {
                return;
            }

            if (!button) {
                return;
            }

            if (!target.value) {
                button.classList.add('disable');
                return;
            }

            button.classList.remove('disable');
        });

        return {
            dom: {
                wrapper,
                input,
                button,
            },
        };
    });
};
