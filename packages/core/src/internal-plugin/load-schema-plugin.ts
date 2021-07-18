import { LoadSchema } from '../constant';
import type { MilkdownPlugin } from '../utility';

export const loadSchemaPlugin: MilkdownPlugin = () => () => {
    LoadSchema.done();
};
