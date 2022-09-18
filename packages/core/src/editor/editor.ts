/* Copyright 2021, Milkdown by Mirone. */
import { createClock, createContainer, Ctx, CtxHandler, MilkdownPlugin, Post, Pre } from '@milkdown/ctx';

import {
    commands,
    config,
    editorState,
    editorView,
    init,
    parser,
    schema,
    serializer,
    themeEnvironment,
} from '../internal-plugin';

export enum EditorStatus {
    Init = 'Init',
    Running = 'Running',
    Destroyed = 'Destroyed',
}

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

    #status = EditorStatus.Init;

    readonly #container = createContainer();
    readonly #clock = createClock();

    readonly #plugins: Map<MilkdownPlugin, { handler: CtxHandler; cleanup: ReturnType<CtxHandler> }> = new Map();
    readonly #configureList: CtxHandler[] = [];

    readonly #ctx = new Ctx(this.#container, this.#clock);
    readonly #pre = new Pre(this.#container, this.#clock);
    readonly #post = new Post(this.#container, this.#clock);

    readonly #loadInternal = () => {
        const internalPlugins = [
            themeEnvironment,
            schema,
            parser,
            serializer,
            commands,
            editorState,
            editorView,
            init(this),
        ];
        const configPlugin = config(async (x: Ctx) => {
            await Promise.all(this.#configureList.map((fn) => fn(x)));
        });
        this.use(internalPlugins.concat(configPlugin));
    };

    /**
     * Get the ctx of the editor.
     *
     * @returns The ctx of the editor.
     */
    get ctx() {
        return this.#ctx;
    }

    get status() {
        return this.#status;
    }

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
    readonly use = (plugins: MilkdownPlugin | MilkdownPlugin[]) => {
        [plugins].flat().forEach((plugin) => {
            this.#plugins.set(plugin, {
                handler: plugin(this.#pre),
                cleanup: void 0,
            });
        });
        return this;
    };

    /**
     * Config the context for current editor.
     *
     * @param configure - The function that configure current editor, can be async, with context as parameter.
     * @returns Editor instance.
     */
    readonly config = (configure: CtxHandler) => {
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
    readonly create = async () => {
        this.#loadInternal();
        await Promise.all(
            [...this.#plugins.entries()].map(async ([key, loader]) => {
                const cleanup = await loader.handler(this.#ctx);
                this.#plugins.set(key, { ...loader, cleanup });

                return cleanup;
            }),
        );
        this.#status = EditorStatus.Running;
        return this;
    };

    /**
     * Remove one plugin or a list of plugins from current editor.
     *
     * @param plugins - A list of plugins, or one plugin.
     * @returns Editor instance.
     */
    readonly remove = async (plugins: MilkdownPlugin | MilkdownPlugin[]) => {
        await Promise.all(
            [plugins].flat().map((plugin) => {
                const loader = this.#plugins.get(plugin);
                const cleanup = loader?.cleanup;
                this.#plugins.delete(plugin);

                if (typeof cleanup === 'function') {
                    return cleanup(this.#post);
                }
            }),
        );
        return this;
    };

    readonly destroy = async () => {
        await Promise.all(
            [...this.#plugins.entries()].map(async ([key, loader]) => {
                const { cleanup } = loader;

                this.#plugins.delete(key);
                if (typeof cleanup === 'function') {
                    return cleanup(this.#post);
                }
            }),
        );
        this.#status = EditorStatus.Destroyed;
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
    readonly action = <T>(action: (ctx: Ctx) => T) => action(this.#ctx);
}
