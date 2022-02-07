/* Copyright 2021, Milkdown by Mirone. */
import { Color, Emotion, ThemeColor, ThemeManager, ThemeSize } from '@milkdown/core';
import type { ThemeImageType } from '@milkdown/preset-commonmark';

export const image = (manager: ThemeManager, { css }: Emotion) => {
    const palette = (color: Color, opacity = 1) => manager.get(ThemeColor, [color, opacity]);

    manager.setCustom<ThemeImageType>('image', (options) => {
        const placeholder = {
            loading: 'Loading...',
            empty: 'Add an Image',
            failed: 'Image loads failed',
            ...(options?.placeholder ?? {}),
        };
        const isBlock = options?.isBlock ?? false;

        return css`
            display: inline-block;
            position: relative;
            text-align: center;
            font-size: 0;
            vertical-align: text-bottom;
            line-height: 1;

            ${isBlock
                ? `
                width: 100%;
                margin: 0 auto;
                `
                : ''}

            &.ProseMirror-selectednode::after {
                content: '';
                background: ${palette('secondary', 0.38)};
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
            }

            img {
                max-width: 100%;
                height: auto;
                object-fit: contain;
                margin: 0 2px;
            }
            .icon,
            .placeholder {
                display: none;
            }

            &.system {
                width: 100%;
                padding: 0 2rem;

                img {
                    width: 0;
                    height: 0;
                    display: none;
                }

                .icon,
                .placeholder {
                    display: inline;
                }

                box-sizing: border-box;
                height: 3rem;
                background-color: ${palette('background')};
                border-radius: ${manager.get(ThemeSize, 'radius')};
                display: inline-flex;
                gap: 2rem;
                justify-content: flex-start;
                align-items: center;
                .placeholder {
                    margin: 0;
                    line-height: 1;
                    &::before {
                        content: '';
                        font-size: 0.875rem;
                        color: ${palette('neutral', 0.6)};
                    }
                }
            }

            &.loading {
                .placeholder {
                    &::before {
                        content: '${placeholder.loading}';
                    }
                }
            }

            &.empty {
                .placeholder {
                    &::before {
                        content: '${placeholder.empty}';
                    }
                }
            }

            &.failed {
                .placeholder {
                    &::before {
                        content: '${placeholder.failed}';
                    }
                }
            }
        `;
    });
};
