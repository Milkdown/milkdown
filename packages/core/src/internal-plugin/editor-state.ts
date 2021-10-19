/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, createTimer, MilkdownPlugin, Timer } from '@milkdown/ctx';
import { docTypeError } from '@milkdown/exception';
import {
    baseKeymap,
    DOMParser,
    EditorState,
    inputRules as createInputRules,
    keymap as createKeymap,
    Node,
    Schema,
} from '@milkdown/prose';

import { AnyRecord } from '../utility';
import { inputRulesCtx, InputRulesReady } from './input-rules';
import { keymapCtx, KeymapReady } from './keymap';
import { Parser, parserCtx, ParserReady } from './parser';
import { prosePluginsCtx } from './prose-plugin-factory';
import { schemaCtx } from './schema';
import { SerializerReady } from './serializer';

type DefaultValue = string | { type: 'html'; dom: HTMLElement } | { type: 'json'; value: AnyRecord };
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
        .inject(editorStateTimerCtx, [KeymapReady, InputRulesReady, ParserReady, SerializerReady])
        .record(EditorStateReady);

    return async (ctx) => {
        await ctx.waitTimers(editorStateTimerCtx);

        const schema = ctx.get(schemaCtx);
        const parser = ctx.get(parserCtx);
        const rules = ctx.get(inputRulesCtx);
        const keymap = ctx.get(keymapCtx);
        const options = ctx.get(editorStateOptionsCtx);
        const prosePlugins = ctx.get(prosePluginsCtx);
        const defaultValue = ctx.get(defaultValueCtx);
        const doc = getDoc(defaultValue, parser, schema);

        const state = EditorState.create({
            schema,
            doc,
            plugins: [...prosePlugins, ...keymap, createKeymap(baseKeymap), createInputRules({ rules })],
            ...options,
        });
        ctx.set(editorStateCtx, state);
        ctx.done(EditorStateReady);
    };
};
