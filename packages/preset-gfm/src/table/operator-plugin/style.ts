/* Copyright 2021, Milkdown by Mirone. */
import { Emotion, getPalette, ThemeBorder, ThemeManager, ThemeShadow, ThemeSize } from '@milkdown/core';

export const injectStyle = (themeManager: ThemeManager, { css, injectGlobal }: Emotion) => {
    const palette = getPalette(themeManager);
    const radius = themeManager.get(ThemeSize, 'radius');
    const lineWidth = themeManager.get(ThemeSize, 'lineWidth');

    injectGlobal`
        .milkdown {
            .tableWrapper {
                table {
                    width: calc(100% - 32px) !important;
                    margin: 16px 0 16px 16px !important;

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
                        left: -14px;
                        top: 0;
                        bottom: 0;
                        width: 8px;
                    }

                    .milkdown-cell-top {
                        left: 0;
                        right: 0;
                        top: -14px;
                        height: 8px;
                    }

                    .milkdown-cell-point {
                        left: -18px;
                        top: -18px;
                        width: 16px;
                        height: 16px;

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
        }
    `;

    return css`
        display: inline-flex;
        cursor: pointer;
        z-index: 2;

        justify-content: space-evenly;

        position: absolute;

        border-radius: ${radius};

        ${themeManager.get(ThemeBorder, undefined)};
        ${themeManager.get(ThemeShadow, undefined)};

        overflow: hidden;
        background: ${palette('surface')};

        .icon {
            position: relative;
            color: ${palette('solid', 0.87)};

            width: 48px;
            line-height: 48px;
            text-align: center;
            transition: all 0.4s ease-in-out;

            &:hover {
                background-color: ${palette('secondary', 0.12)};
            }

            &.active {
                color: ${palette('primary')};
            }

            &:not(:last-child)::after {
                content: '';
                position: absolute;
                right: 0;
                top: 0;
                width: ${lineWidth};
                bottom: 0;
                background: ${palette('line')};
            }
        }

        &.hide,
        .hide {
            display: none;
        }
    `;
};
