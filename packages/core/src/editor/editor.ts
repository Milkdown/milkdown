import { createContainer, Meta } from '../context';
import { parser, schema, serializer, editorView, init, keymap, inputRules, config } from '../internal-plugin';
import { Configure, Ctx, MilkdownPlugin, Pre } from '../utility';

const internalPlugins = [schema, parser, serializer, editorView, keymap, inputRules, init];

export class Editor {
    #container = createContainer();
    #ctx: Ctx = {
        use: this.#container.getCtx,
    };
    #plugins: Set<(ctx: Ctx) => void> = new Set();
    #configure: Configure = () => undefined;
    inject = <T>(meta: Meta<T>) => {
        meta(this.#container.contextMap);
        return this.#pre;
    };
    #pre: Pre = {
        inject: this.inject,
    };

    #loadInternal = () => {
        this.use(internalPlugins.concat(config(this.#configure)));
    };

    use = (plugins: MilkdownPlugin | MilkdownPlugin[]) => {
        if (Array.isArray(plugins)) {
            plugins.forEach((plugin) => {
                this.#plugins.add(plugin(this.#pre));
            });
            return this;
        }

        this.#plugins.add(plugins(this.#pre));
        return this;
    };

    config = (configure: Configure) => {
        this.#configure = configure;
        return this;
    };

    create = () => {
        this.#loadInternal();
        this.#plugins.forEach((loader) => {
            loader(this.#ctx);
        });
        return this;
    };
}
