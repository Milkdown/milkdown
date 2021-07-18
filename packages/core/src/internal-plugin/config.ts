import { createTiming } from '../timing';
import { Configure, MilkdownPlugin } from '../utility';

export const Config = createTiming('Config');

export const config =
    (configure: Configure): MilkdownPlugin =>
    () =>
    async (ctx) => {
        await configure(ctx);
        Config.done();
    };
