import { EmojiButton } from '@joeattardi/emoji-button';
import { prosePluginFactory } from '@milkdown/core';
import { Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import twemoji from 'twemoji';

const keyword = ':emoji:';

const pickerPlugin = () => {
    let trigger = false;
    const emojiPicker = new EmojiButton({
        style: 'twemoji',
        theme: 'dark',
    });
    const holder = document.createElement('span');
    let _from = 0;
    let _to = 0;
    const off = () => {
        if (trigger) {
            trigger = false;
            emojiPicker.hidePicker();
        }
    };

    const plugin = new Plugin({
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
                const checkTrigger = () => {
                    if (view.composing) return false;
                    const { state } = view;
                    const $from = state.doc.resolve(from);
                    if ($from.parent.type.spec.code) return false;
                    const textBefore =
                        $from.parent.textBetween(
                            $from.parentOffset - keyword.length + 1,
                            $from.parentOffset,
                            undefined,
                            '\ufffc',
                        ) + text;
                    if (textBefore === keyword) {
                        _from = from - keyword.length + 1;
                        _to = to + 1;
                        return true;
                    }
                    return false;
                };
                trigger = checkTrigger();
                if (!trigger) {
                    _from = 0;
                    _to = 0;
                }
                return false;
            },
            decorations(state) {
                if (!trigger) return null;

                return DecorationSet.create(state.doc, [Decoration.widget(state.selection.to, holder)]);
            },
        },
        view: (editorView) => {
            emojiPicker.on('emoji', (selection) => {
                const { emoji } = selection;
                const html = twemoji.parse(emoji, { attributes: (text) => ({ title: text }) });
                off();
                const { tr } = editorView.state;
                const node = editorView.state.schema.node('emoji', { html });

                editorView.dispatch(tr.replaceRangeWith(_from, _to, node));
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

export const picker = prosePluginFactory(pickerPlugin());
