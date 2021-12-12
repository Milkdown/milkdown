/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, createTimer, MilkdownPlugin, Timer } from '@milkdown/ctx';
import { docTypeError } from '@milkdown/exception';
import {
    baseKeymap,
    customInputRules as createInputRules,
    DOMParser,
    EditorState,
    keymap as createKeymap,
    Node,
    Schema,
} from '@milkdown/prose';
import { JSONRecord } from '@milkdown/transformer';

import { CommandsReady } from '.';
import { inputRulesCtx, prosePluginsCtx } from './init';
import { Parser, parserCtx, ParserReady } from './parser';
import { schemaCtx } from './schema';
import { SerializerReady } from './serializer';

type DefaultValue = string | { type: 'html'; dom: HTMLElement } | { type: 'json'; value: JSONRecord };
type StateOptions = Parameters<typeof EditorState.create>[0];

export const defaultValueCtx = createSlice<DefaultValue>('', 'defaultValue');
export const editorStateCtx = createSlice<EditorState>({} as EditorState, 'editorState');
export const editorStateOptionsCtx = createSlice<StateOptions>({}, 'stateOptions');
export const editorStateTimerCtx = createSlice<Timer[]>([], 'editorStateTimer');

export const EditorStateReady = createTimer('EditorStateReady');

const getDoc = (defaultValue: DefaultValue, parser: Parser, schema: Schema) => {
    if (typeof defaultValue === 'string') {
        return parser(defaultValue);
    }

    if (defaultValue.type === 'html') {
        return DOMParser.fromSchema(schema).parse(defaultValue.dom);
    }

    if (defaultValue.type === 'json') {
        return Node.fromJSON(schema, defaultValue.value);
    }

    throw docTypeError(defaultValue);
};

export const editorState: MilkdownPlugin = (pre) => {
    pre.inject(defaultValueCtx)
        .inject(editorStateCtx)
        .inject(editorStateOptionsCtx)
        .inject(editorStateTimerCtx, [ParserReady, SerializerReady, CommandsReady])
        .record(EditorStateReady);

    return async (ctx) => {
        await ctx.waitTimers(editorStateTimerCtx);

        const schema = ctx.get(schemaCtx);
        const parser = ctx.get(parserCtx);
        const rules = ctx.get(inputRulesCtx);
        const options = ctx.get(editorStateOptionsCtx);
        const prosePlugins = ctx.get(prosePluginsCtx);
        const defaultValue = ctx.get(defaultValueCtx);
        const doc = getDoc(defaultValue, parser, schema);

        const state = EditorState.create({
            schema,
            doc,
            plugins: [...prosePlugins, createInputRules({ rules }), createKeymap(baseKeymap)],
            ...options,
        });
        ctx.set(editorStateCtx, state);
        ctx.done(EditorStateReady);
    };
};
