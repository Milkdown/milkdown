import type { MilkdownPlugin } from '../utility';
import { createTiming } from '../timing';
import { SchemaReady } from '.';
import { Config } from './config';

export const Initialize = createTiming('Initialize');
export const Complete = createTiming('complete');

export const init: MilkdownPlugin = () => async () => {
    await Config();
    Initialize.done();

    await SchemaReady();
    Complete.done();
};
