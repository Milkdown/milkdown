import { createContainer, Meta } from '../context';
import { parser, schema, serializer, editorView, init, keymap, inputRules } from '../internal-plugin';
import { Ctx, MilkdownPlugin, Pre } from '../utility';

const internalPlugins = [schema, parser, serializer, editorView, keymap, inputRules];

export class Editor {
    #container = createContainer();
    #ctx: Ctx = {
        use: this.#container.getCtx,
    };
    #plugins: Set<(ctx: Ctx) => void> = new Set();
    inject = <T>(meta: Meta<T>) => {
        meta(this.#container.contextMap);
        return this;
    };
    #pre: Pre = {
        inject: this.inject,
    };

    #loadInternal = () => {
        // Ensure the init plugin is the last one to be called.
        this.use(internalPlugins.concat(init));
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

    create = () => {
        this.#loadInternal();
        this.#plugins.forEach((loader) => {
            loader(this.#ctx);
        });
        return this;
    };
}
