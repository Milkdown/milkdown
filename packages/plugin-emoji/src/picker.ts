/* Copyright 2021, Milkdown by Mirone. */
import { EmojiButton } from '@joeattardi/emoji-button';
import { Color, ThemeColor, ThemeFont } from '@milkdown/core';
import { Decoration, DecorationSet, EditorView, Plugin, PluginKey } from '@milkdown/prose';
import { Utils } from '@milkdown/utils';

import { parse } from './parse';

const keyword = ':emoji:';
export const key = new PluginKey('MILKDOWN_PLUGIN_EMOJI_PICKER');

const checkTrigger = (
    view: EditorView,
    from: number,
    to: number,
    text: string,
    setRange: (from: number, to: number) => void,
) => {
    if (view.composing) return false;
    const { state } = view;
    const $from = state.doc.resolve(from);
    if ($from.parent.type.spec.code) return false;
    const textBefore =
        $from.parent.textBetween($from.parentOffset - keyword.length + 1, $from.parentOffset, undefined, '\ufffc') +
        text;
    if (textBefore === keyword) {
        setRange(from - keyword.length + 1, to + 1);
        return true;
    }
    return false;
};

export const picker = (utils: Utils) => {
    let trigger = false;
    const holder = document.createElement('span');
    let _from = 0;
    let _to = 0;
    const off = () => {
        trigger = false;
        _from = 0;
        _to = 0;
    };

    const plugin = new Plugin({
        key,
        props: {
            handleKeyDown() {
                off();
                return false;
            },
            handleClick() {
                off();
                return false;
            },
            handleTextInput(view, from, to, text) {
                trigger = checkTrigger(view, from, to, text, (from, to) => {
                    _from = from;
                    _to = to;
                });

                if (!trigger) {
                    off();
                }
                return false;
            },
            decorations(state) {
                if (!trigger) return null;

                return DecorationSet.create(state.doc, [Decoration.widget(state.selection.to, holder)]);
            },
        },
        view: (editorView) => {
            const { parentNode } = editorView.dom;
            if (!parentNode) {
                throw new Error();
            }
            utils.getStyle((themeManager, { injectGlobal }) => {
                const palette = (color: Color, opacity = 1) => themeManager.get(ThemeColor, [color, opacity]);
                const typography = themeManager.get(ThemeFont, 'typography');
                const css = injectGlobal;
                css`
                    .emoji-picker {
                        --dark-search-background-color: ${palette('surface')} !important;
                        --dark-text-color: ${palette('neutral', 0.87)} !important;
                        --dark-background-color: ${palette('background')} !important;
                        --dark-border-color: ${palette('shadow')} !important;
                        --dark-hover-color: ${palette('secondary', 0.12)} !important;
                        --dark-blue-color: ${palette('primary')} !important;
                        --dark-search-icon-color: ${palette('primary')} !important;
                        --dark-category-button-color: ${palette('secondary', 0.4)} !important;
                        --font: ${typography} !important;
                        --font-size: 1em !important;
                    }
                `;
            });
            const emojiPicker = new EmojiButton({
                rootElement: parentNode as HTMLElement,
                autoFocusSearch: false,
                style: 'twemoji',
                theme: 'dark',
                zIndex: 99,
            });
            emojiPicker.on('emoji', (selection) => {
                const start = _from;
                const end = _to;
                off();
                const html = parse(selection.emoji);
                const node = editorView.state.schema.node('emoji', { html });
                const { tr } = editorView.state;

                editorView.dispatch(tr.replaceRangeWith(start, end, node));
            });
            return {
                update: () => {
                    if (!trigger) {
                        emojiPicker.hidePicker();
                        return null;
                    }
                    emojiPicker.showPicker(holder);
                    return null;
                },
                destroy: () => {
                    emojiPicker.destroyPicker();
                },
            };
        },
    });

    return plugin;
};
