import { createContainer, Meta } from '../context';
import {
    parser,
    schema,
    serializer,
    editorView,
    init,
    keymap,
    inputRules,
    config,
    nodeView,
    editorState,
} from '../internal-plugin';
import { createClock, Timer } from '../timing';
import { Configure, Ctx, CtxHandler, MilkdownPlugin, Pre } from '../utility';

export class Editor {
    #container = createContainer();
    #clock = createClock();

    #ctx: Ctx = {
        use: this.#container.getCtx,
        get: (meta) => this.#container.getCtx(meta).get(),
        set: (meta, value) => this.#container.getCtx(meta).set(value),
        update: (meta, updater) => this.#container.getCtx(meta).update(updater),

        wait: (timer) => this.#clock.get(timer)(),
        done: (timer) => this.#clock.get(timer).done(),
    };

    #plugins: Set<CtxHandler> = new Set();

    inject = <T>(meta: Meta<T>, resetValue?: T) => {
        meta(this.#container.contextMap, resetValue);
        return this.#pre;
    };

    record = (timingMeta: Timer) => {
        timingMeta(this.#clock.store);
        return this.#pre;
    };

    #pre: Pre = {
        inject: this.inject,
        record: this.record,
    };

    use = (plugins: MilkdownPlugin | MilkdownPlugin[]) => {
        [plugins].flat().forEach((plugin) => {
            this.#plugins.add(plugin(this.#pre));
        });
        return this;
    };

    #loadInternal = () => {
        const internalPlugins = [schema, parser, serializer, nodeView, keymap, inputRules, editorState, editorView];
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
