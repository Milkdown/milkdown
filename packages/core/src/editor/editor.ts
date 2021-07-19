import { createContainer, Meta } from '../context';
import { parser, schema, serializer, editorView, init, keymap, inputRules, config, nodeView } from '../internal-plugin';
import { Configure, Ctx, CtxHandler, MilkdownPlugin, Pre } from '../utility';

const internalPlugins = [schema, parser, serializer, nodeView, keymap, inputRules, editorView];

export class Editor {
    #container = createContainer();
    #ctx: Ctx = {
        use: this.#container.getCtx,
        get: (meta) => this.#container.getCtx(meta).get(),
        set: (meta, value) => this.#container.getCtx(meta).set(value),
        update: (meta, updater) => this.#container.getCtx(meta).update(updater),
    };
    #plugins: Set<CtxHandler> = new Set();
    #configure: Configure = () => undefined;
    inject = <T>(meta: Meta<T>, resetValue?: T) => {
        meta(this.#container.contextMap, resetValue);
        return this.#pre;
    };
    #pre: Pre = {
        inject: this.inject,
    };

    #loadInternal = () => {
        this.use(internalPlugins.concat(init(this)).concat(config(this.#configure)));
    };

    use = (plugins: MilkdownPlugin | MilkdownPlugin[]) => {
        [plugins].flat().forEach((plugin) => {
            this.#plugins.add(plugin(this.#pre));
        });
        return this;
    };

    config = (configure: Configure) => {
        this.#configure = configure;
        return this;
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

    action = <T>(action: (ctx: Ctx) => T) => action(this.#ctx);
}
