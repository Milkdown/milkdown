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

    #ctx = new Ctx(this.#container, this.#clock);
    #pre = new Pre(this.#container, this.#clock);

    use = (plugins: MilkdownPlugin | MilkdownPlugin[]) => {
        [plugins].flat().forEach((plugin) => {
            this.#plugins.add(plugin(this.#pre));
        });
        return this;
    };

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

    create = async () => {
        this.#loadInternal();
        await Promise.all(
            [...this.#plugins].map((loader) => {
                return loader(this.#ctx);
            }),
        );
        return this;
    };

    #configureList: Configure[] = [];

    config = (configure: Configure) => {
        this.#configureList.push(configure);
        return this;
    };

    action = <T>(action: (ctx: Ctx) => T) => action(this.#ctx);
}
