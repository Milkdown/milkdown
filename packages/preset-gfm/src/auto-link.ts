/* Copyright 2021, Milkdown by Mirone. */
import { InputRule, inputRules } from '@milkdown/prose/inputrules';
import { $prose } from '@milkdown/utils';

const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

const proseUrlPlugin = () =>
    inputRules({
        rules: [
            new InputRule(urlRegex, (state, match, start, end) => {
                const { schema } = state;
                const [text] = match;
                if (!text) return null;

                const link = schema.marks['link']?.create({ href: text });
                if (!link) return null;

                return state.tr.replaceWith(start, end, schema.text(text)).addMark(start, text.length + start, link);
            }),
        ],
    });

export const urlPlugin = $prose(() => proseUrlPlugin());
