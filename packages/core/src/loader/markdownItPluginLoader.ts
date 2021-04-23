import { PluginSimple, PluginWithOptions, PluginWithParams } from 'markdown-it';
import { Atom } from '../abstract';
import { AtomType, LoadState } from '../constant';
import { IdleContext } from '../editor';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MarkdownItPlugin = PluginSimple | [PluginWithOptions, any] | [PluginWithParams, ...any[]];

const markdownItPluginLoader = (id: string) => {
    return class ProsemirrorPluginLoader extends Atom<
        IdleContext,
        IdleContext,
        { plugins: (ctx: IdleContext) => MarkdownItPlugin[] }
    > {
        id = id;
        type = AtomType.ProsemirrorPlugin;
        loadAfter = LoadState.SchemaReady;
        main() {
            const plugins = this.options.plugins(this.context);
            const md = plugins.reduce((instance, plugin) => {
                if (Array.isArray(plugin)) {
                    return instance.use(...(plugin as [PluginWithOptions]));
                }

                return instance.use(plugin);
            }, this.context.markdownIt);
            this.updateContext({
                markdownIt: md,
            });
        }
    };
};

export const createMarkdownItPlugin = (id: string, plugins: (ctx: IdleContext) => MarkdownItPlugin[]) => {
    const Factory = markdownItPluginLoader(id);
    return new Factory({ plugins });
};
