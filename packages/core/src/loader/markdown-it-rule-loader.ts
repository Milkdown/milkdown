import { Atom } from '../abstract';
import { AtomType, LoadState } from '../constant';
import { IdleContext } from '../editor';

const markdownItRuleLoader = (id: string) => {
    return class ProsemirrorPluginLoader extends Atom<
        IdleContext,
        IdleContext,
        { rules: (ctx: IdleContext) => string[] }
    > {
        id = id;
        type = AtomType.ProsemirrorPlugin;
        loadAfter = LoadState.SchemaReady;
        main() {
            const rules = this.options.rules(this.context);
            const md = this.context.markdownIt.enable(rules);
            this.updateContext({
                markdownIt: md,
            });
        }
    };
};

export const createMarkdownItRule = (id: string, rules: (ctx: IdleContext) => string[]) => {
    const Factory = markdownItRuleLoader(id);
    return new Factory({ rules });
};
