import { Atom } from '../abstract';
import { LoadState } from '../constant';
import { IdleContext } from '../editor';

const markdownItRuleLoader = (id: string) =>
    class ProsemirrorPluginLoader extends Atom<IdleContext, IdleContext, { rules: (ctx: IdleContext) => string[] }> {
        override id = id;
        override loadAfter = LoadState.SchemaReady;
        override main() {
            const rules = this.options.rules(this.context);
            const md = this.context.markdownIt.enable(rules);
            this.updateContext({
                markdownIt: md,
            });
        }
    };

export const createMarkdownItRule = (id: string, rules: (ctx: IdleContext) => string[]) => {
    const Factory = markdownItRuleLoader(id);
    return new Factory({ rules });
};
