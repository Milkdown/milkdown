/* Copyright 2021, Milkdown by Mirone. */
import {
    BorderKey,
    ColorKey,
    FontKey,
    GlobalKey,
    hex2rgb,
    IconKey,
    ScrollbarKey,
    ShadowKey,
    SizeKey,
    themeFactory,
} from '@milkdown/core';

import { code, typography } from './font';
import { darkColor, lightColor } from './nord';
import { getIcon } from './slots';
import { view } from './view';

export const font = {
    typography,
    code,
};

export const size = {
    radius: '4px',
    lineWidth: '1px',
};

export const getNord = (isDarkMode = false) =>
    themeFactory((emotion, manager) => {
        const { css } = emotion;
        const colorSet = isDarkMode ? darkColor : lightColor;

        manager.set(ColorKey, (options) => {
            if (!options) return null;
            const [key, opacity] = options;
            const hex = colorSet[key];
            const rgb = hex2rgb(hex);
            if (!rgb) return null;

            return `rgba(${rgb?.join(', ')}, ${opacity || 1})`;
        });

        manager.set(SizeKey, (key) => {
            if (!key) return null;
            return size[key];
        });

        manager.set(FontKey, (key) => {
            if (!key) return null;
            return font[key];
        });

        manager.set(ScrollbarKey, (direction = 'y') => {
            const main = manager.get(ColorKey, ['secondary', 0.38]);
            const bg = manager.get(ColorKey, ['secondary', 0.12]);
            const hover = manager.get(ColorKey, ['secondary']);
            return css`
                scrollbar-width: thin;
                scrollbar-color: ${main} ${bg};
                -webkit-overflow-scrolling: touch;

                &::-webkit-scrollbar {
                    ${direction === 'y' ? 'width' : 'height'}: 12px;
                    background-color: transparent;
                }

                &::-webkit-scrollbar-track {
                    border-radius: 999px;
                    background: transparent;
                    border: 4px solid transparent;
                }

                &::-webkit-scrollbar-thumb {
                    border-radius: 999px;
                    background-color: ${main};
                    border: 4px solid transparent;
                    background-clip: content-box;
                }

                &::-webkit-scrollbar-thumb:hover {
                    background-color: ${hover};
                }
            `;
        });

        manager.set(ShadowKey, () => {
            const { lineWidth } = size;
            const getShadow = (opacity: number) => manager.get(ColorKey, ['shadow', opacity]);
            return css`
                box-shadow: 0px ${lineWidth} ${lineWidth} ${getShadow(0.14)}, 0px 2px ${lineWidth} ${getShadow(0.12)},
                    0px ${lineWidth} 3px ${getShadow(0.2)};
            `;
        });

        manager.set(BorderKey, (direction) => {
            const line = manager.get(ColorKey, ['line']);
            if (!direction) {
                return css`
                    border: ${size.lineWidth} solid ${line};
                `;
            }
            return css`
                ${`border-${direction}`}: ${size.lineWidth} solid ${line};
            `;
        });

        manager.set(IconKey, (icon) => {
            if (!icon) return null;

            return getIcon(icon);
        });

        manager.set(GlobalKey, () => {
            const css = emotion.injectGlobal;
            const neutral = manager.get(ColorKey, ['neutral', 0.87]);
            const surface = manager.get(ColorKey, ['surface']);
            const line = manager.get(ColorKey, ['line']);
            const highlight = manager.get(ColorKey, ['secondary', 0.38]);

            css`
                ${view(emotion)};
                .milkdown {
                    color: ${neutral};
                    background: ${surface};

                    position: relative;
                    font-family: ${font.typography};
                    margin-left: auto;
                    margin-right: auto;
                    ${manager.get(ShadowKey)}
                    box-sizing: border-box;
                    ${manager.get(ScrollbarKey)}

                    .editor {
                        padding: 3.125rem 1.25rem;
                        outline: none;
                        & > * {
                            margin: 1.875rem 0;
                        }

                        @media only screen and (min-width: 72rem) {
                            max-width: 57.375rem;
                            padding: 3.125rem 7.25rem;
                        }
                    }

                    .ProseMirror-selectednode {
                        outline: ${size.lineWidth} solid ${line};
                    }

                    li.ProseMirror-selectednode {
                        outline: none;
                    }

                    li.ProseMirror-selectednode::after {
                        ${manager.get(BorderKey)};
                    }

                    & ::selection {
                        background: ${highlight};
                    }
                }
            `;

            return;
        });
    });

const darkMode = Boolean(window.matchMedia?.('(prefers-color-scheme: dark)').matches);
export const nord = getNord(darkMode);

export { color, darkColor, lightColor } from './nord';
export { view } from './view';
