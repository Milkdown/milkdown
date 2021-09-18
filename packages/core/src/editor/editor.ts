/* Copyright 2021, Milkdown by Mirone. */
import { createContainer } from '../context';
import {
    commands,
    config,
    editorState,
    editorView,
    init,
    inputRules,
    keymap,
    nodeView,
    parser,
    schema,
    serializer,
} from '../internal-plugin';
import { createClock } from '../timing';
import { Configure, CtxHandler, MilkdownPlugin } from '../utility';
import { Ctx } from './ctx';
import { Pre } from './pre';

/**
 * Get the milkdown editor constructor
 */
export class Editor {
    /**
     * Create a new editor instance.
     *
     * @returns The new editor instance been created.
     */
    static make() {
        return new Editor();
    }

    #container = createContainer();
    #clock = createClock();

    #plugins: Set<CtxHandler> = new Set();
    #configureList: Configure[] = [];

    #ctx = new Ctx(this.#container, this.#clock);
    #pre = new Pre(this.#container, this.#clock);

    #loadInternal = () => {
        const internalPlugins = [
            schema,
            parser,
            serializer,
            nodeView,
            commands,
            keymap,
            inputRules,
            editorState,
            editorView,
        ];
        const configPlugin = config(async (x) => {
            await Promise.all(this.#configureList.map((fn) => fn(x)));
        });
        this.use(internalPlugins.concat(init(this)).concat(configPlugin));
    };

    /**
     * Use one plugin or a list of plugins for current editor.
     *
     * @example
     * ```
     * Editor.make()
     *   .use(plugin)
     *   .use([pluginA, pluginB])
     * ```
     *
     * @param plugins - A list of plugins, or one plugin.
     * @returns Editor instance.
     */
    use = (plugins: MilkdownPlugin | MilkdownPlugin[]) => {
        [plugins].flat().forEach((plugin) => {
            this.#plugins.add(plugin(this.#pre));
        });
        return this;
    };

    /**
     * Config the context for current editor.
     *
     * @param configure - The function that configure current editor, can be async, with context as parameter.
     * @returns Editor instance.
     */
    config = (configure: Configure) => {
        this.#configureList.push(configure);
        return this;
    };

    /**
     * Create the editor UI.
     *
     * @example
     * ```
     * Editor.make().use(nord).use(commonmark).create()
     * ```
     *
     * @returns A promise object, will be resolved as editor instance after create finish.
     */
    create = async () => {
        this.#loadInternal();
        await Promise.all(
            [...this.#plugins].map((loader) => {
                return loader(this.#ctx);
            }),
        );
        return this;
    };

    /**
     * Get the context value in a running editor on demand and return the action result.
     *
     * @example
     * ```
     * import { Editor, editorViewCtx, serializerCtx } from '@milkdown/core';
     * async function playWithEditor() {
     *     const editor = await Editor.make().use(commonmark).create();
     *
     *     const getMarkdown = () =>
     *         editor.action((ctx) => {
     *             const editorView = ctx.get(editorViewCtx);
     *             const serializer = ctx.get(serializerCtx);
     *             return serializer(editorView.state.doc);
     *         });
     *
     *     // get markdown string:
     *     getMarkdown();
     * }
     * ```
     *
     * @param action - The function that get editor context and return the action result.
     * @returns The action result.
     */
    action = <T>(action: (ctx: Ctx) => T) => action(this.#ctx);
}
