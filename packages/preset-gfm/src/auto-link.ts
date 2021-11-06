/* Copyright 2021, Milkdown by Mirone. */
import { InputRule, inputRules } from '@milkdown/prose';
import { createPlugin } from '@milkdown/utils';

const urlRegex =
    /(https?:\/\/)?www\.[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}\b(?:[-a-zA-Z0-9@:%._+~#=?!&/]*)(?:[-a-zA-Z0-9@:%._+~#=?!&/]*)$/;

const proseUrlPlugin = () =>
    inputRules({
        rules: [
            new InputRule(urlRegex, (state, match, start, end) => {
                const { schema } = state;
                const [text] = match;
                if (!text) return null;

                return state.tr
                    .replaceWith(start, end, schema.text(text))
                    .addMark(
                        start,
                        text.length + start,
                        schema.marks.link.create({ href: text.startsWith('www') ? `https://${text}` : text }),
                    );
            }),
        ],
    });

export const urlPlugin = createPlugin(() => ({ prosePlugins: () => [proseUrlPlugin()] }));
