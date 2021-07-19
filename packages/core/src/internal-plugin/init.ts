import type { MilkdownPlugin } from '../utility';
import { createTiming } from '../timing';
import { SchemaReady } from '.';
import { Config } from './config';
import { Complete } from './editor-view';

export const Initialize = createTiming('Initialize');
export const Render = createTiming('Render');

export const init: MilkdownPlugin = () => async () => {
    await Config();
    Initialize.done();

    await SchemaReady();
    Render.done();

    await Complete();
};
