import { createTimer } from '../timing';
import { Configure, MilkdownPlugin } from '../utility';

export const ConfigReady = createTimer('ConfigReady');

export const config =
    (configure: Configure): MilkdownPlugin =>
    (pre) => {
        pre.record(ConfigReady);

        return async (ctx) => {
            await configure(ctx);
            ctx.done(ConfigReady);
        };
    };
