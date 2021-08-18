import { css, injectGlobal } from '@emotion/css';
import { themeFactory } from '@milkdown/core';

const font = [
    'Roboto',
    'HelveticaNeue-Light',
    'Helvetica Neue Light',
    'Helvetica Neue',
    'Helvetica',
    'Arial',
    'Lucida Grande',
    'sans-serif',
];

const fontCode = ['Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', 'monospace'];

export const Nord = {
    nord0: '#2e3440',
    nord1: '#3b4252',
    nord2: '#434c5e',
    nord3: '#4c566a',
    nord4: '#d8dee9',
    nord5: '#e5e9f0',
    nord6: '#eceff4',
    nord7: '#8fbcbb',
    nord8: '#88c0d0',
    nord9: '#81a1c1',
    nord10: '#5e81ac',
    nord11: '#bf616a',
    nord12: '#d08770',
    nord13: '#ebcb8b',
    nord14: '#a3be8c',
    nord15: '#b48ead',
};

export const nord = themeFactory({
    font: {
        font,
        fontCode,
    },
    size: {
        radius: '4px',
        lineWidth: '1px',
    },
    color: {
        shadow: Nord.nord1,
        primary: Nord.nord10,
        secondary: Nord.nord9,
        light: {
            neutral: Nord.nord0,
            solid: Nord.nord3,
            line: Nord.nord4,
            background: Nord.nord6,
            surface: '#fff',
        },
        dark: {
            neutral: Nord.nord6,
            solid: Nord.nord4,
            line: Nord.nord2,
            background: '#252932',
            surface: Nord.nord0,
        },
    },
    widget: ({ palette, size }) => ({
        icon: (key: string) => css`
            content: '${key}';

            font-family: 'Material Icons Outlined';
            font-weight: normal;
            font-style: normal;
            font-size: 1.5rem;
            line-height: 1;
            text-transform: none;
            letter-spacing: normal;
            word-wrap: normal;
            white-space: nowrap;
            display: inline-block;
            direction: ltr;

            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
            -moz-osx-font-smoothing: grayscale;
            font-feature-settings: liga;
        `,
        scrollbar: (direction = 'y') => css`
            scrollbar-width: thin;
            scrollbar-color: ${palette('secondary', 0.38)} ${palette('secondary', 0.12)};
            -webkit-overflow-scrolling: touch;

            &::-webkit-scrollbar {
                ${[direction === 'x' ? 'width' : 'height']}: 4px;
                padding: 0 2px;
                background: ${palette('surface')};
            }

            &::-webkit-scrollbar-track {
                border-radius: 4px;
                background: ${palette('secondary', 0.12)};
            }

            &::-webkit-scrollbar-thumb {
                border-radius: 4px;
                background: ${palette('secondary', 0.38)};
            }

            &::-webkit-scrollbar-thumb:hover {
                background: ${palette('secondary')};
            }
        `,
        shadow: () => {
            const { lineWidth } = size;
            return css`
                box-shadow: 0px ${lineWidth} ${lineWidth} ${palette('shadow', 0.14)},
                    0px 2px ${lineWidth} ${palette('shadow', 0.12)}, 0px ${lineWidth} 3px ${palette('shadow', 0.2)};
            `;
        },
        border: (direction) => {
            if (!direction) {
                return css`
                    border: ${size.lineWidth} solid ${palette('line')};
                `;
            }
            return css`
                ${`border-${direction}`}: ${size.lineWidth} solid ${palette('line')};
            `;
        },
    }),
    global: ({ palette, font, widget, size }) => {
        const css = injectGlobal;
        css`
            /* copy from https://github.com/ProseMirror/prosemirror-view/blob/master/style/prosemirror.css */
            .ProseMirror {
                position: relative;
            }

            .ProseMirror {
                word-wrap: break-word;
                white-space: pre-wrap;
                white-space: break-spaces;
                -webkit-font-variant-ligatures: none;
                font-variant-ligatures: none;
                font-feature-settings: 'liga' 0; /* the above doesn't seem to work in Edge */
            }

            .ProseMirror pre {
                white-space: pre-wrap;
            }

            .ProseMirror li {
                position: relative;
            }

            .ProseMirror-hideselection *::selection {
                background: transparent;
            }
            .ProseMirror-hideselection *::-moz-selection {
                background: transparent;
            }
            .ProseMirror-hideselection {
                caret-color: transparent;
            }

            .ProseMirror-selectednode {
                outline: 2px solid #8cf;
            }

            /* Make sure li selections wrap around markers */

            li.ProseMirror-selectednode {
                outline: none;
            }

            li.ProseMirror-selectednode:after {
                content: '';
                position: absolute;
                left: -32px;
                right: -2px;
                top: -2px;
                bottom: -2px;
                border: 2px solid #8cf;
                pointer-events: none;
            }

            // milkdown style start
            .milkdown {
                color: ${palette('neutral', 0.87)};
                background: ${palette('surface')};

                position: relative;
                font-family: ${font.font};
                margin-left: auto;
                margin-right: auto;
                ${widget.shadow?.()};
                padding: 3.125rem 1.25rem;
                box-sizing: border-box;

                .editor {
                    outline: none;
                    & > * {
                        margin: 1.875rem 0;
                    }
                }

                .ProseMirror-selectednode {
                    outline: ${size.lineWidth} solid ${palette('line')};
                }

                li.ProseMirror-selectednode {
                    outline: none;
                }

                li.ProseMirror-selectednode::after {
                    ${widget.border?.()}
                }

                @media only screen and (min-width: 72rem) {
                    max-width: 57.375rem;
                    padding: 3.125rem 7.25rem;
                }

                & ::selection {
                    background: ${palette('secondary', 0.38)};
                }
            }
        `;
    },
});
