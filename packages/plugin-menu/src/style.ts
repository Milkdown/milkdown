/* Copyright 2021, Milkdown by Mirone. */
import { css } from '@emotion/css';
import { ThemeTool } from '@milkdown/core';

const itemStyle = ({ font, palette }: ThemeTool) => {
    return css`
        .slash-dropdown-item {
            display: flex;
            gap: 2rem;
            height: 3rem;
            padding: 0 1rem;
            align-items: center;
            justify-content: flex-start;
            cursor: pointer;
            line-height: 2;
            font-family: ${font.typography};
            font-size: 0.875rem;

            transition: all 0.2s ease-in-out;

            &,
            .icon {
                color: ${palette('neutral', 0.87)};
                transition: all 0.2s ease-in-out;
            }

            &.hide {
                display: none;
            }

            &.active {
                background: ${palette('secondary', 0.12)};
                &,
                .icon {
                    color: ${palette('primary')};
                }
            }
            `;
};

export const injectStyle = (themeTool: ThemeTool) => {
    const { mixin, size, palette } = themeTool;
    const style = css`
        width: 20.5rem;
        max-height: 20.5rem;
        overflow-y: auto;
        ${mixin.border?.()};
        border-radius: ${size.radius};
        position: absolute;
        background: ${palette('surface')};

        ${mixin.shadow?.()};

        &.hide {
            display: none;
        }

        ${mixin.scrollbar?.()};

        ${itemStyle(themeTool)}
    `;
    return style;
};
