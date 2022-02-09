/* Copyright 2021, Milkdown by Mirone. */
import { ThemeColor } from '@milkdown/core';
import { Color } from '@milkdown/design-system';
import { Utils } from '@milkdown/utils';

export const injectStyle = (utils: Utils) => {
    return utils.getStyle((themeManager, emotion) => {
        const palette = (color: Color, opacity = 1) => themeManager.get(ThemeColor, [color, opacity]);

        const css = emotion.injectGlobal;
        css`
            .tableWrapper {
                table {
                    width: calc(100% - 2rem) !important;
                    margin: 1rem 0 1rem 1rem !important;

                    .milkdown-cell-left,
                    .milkdown-cell-point,
                    .milkdown-cell-top {
                        position: absolute;

                        &::after {
                            cursor: pointer;
                            position: absolute;
                            top: 0;
                            left: 0;
                            height: 100%;
                            width: 100%;
                            display: block;
                            transition: all 0.2s ease-in-out;
                            background: ${palette('secondary', 0.12)};
                            content: '';
                        }
                        &:hover::after {
                            background: ${palette('secondary', 0.38)};
                        }
                    }

                    .milkdown-cell-left {
                        left: calc(-6px - 0.5rem);
                        top: 0;
                        bottom: 0;
                        width: 0.5rem;
                    }

                    .milkdown-cell-top {
                        left: 0;
                        right: 0;
                        top: calc(-6px - 0.5rem);
                        height: 0.5rem;
                    }

                    .milkdown-cell-point {
                        left: calc(-2px - 1rem);
                        top: calc(-2px - 1rem);
                        width: 1rem;
                        height: 1rem;

                        .icon {
                            position: absolute;
                            top: 0;
                            bottom: 0;
                            left: 0;
                            right: 0;
                        }
                    }
                }
            }
        `;
    });
};
