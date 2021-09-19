/* Copyright 2021, Milkdown by Mirone. */

const functionReplacer = (_: string, value: unknown) => (typeof value === 'function' ? '[Function]' : value);

const stringify = (x: unknown): string => JSON.stringify(x, functionReplacer);

export const docTypeError = (type: unknown) => new Error(`Doc type error, unsupported type: ${stringify(type)}`);

export const contextNotFound = (name: string) => new Error(`Context "${name}" not found, do you forget to inject it?`);

export const timerNotFound = () => new Error('Timer not found, do you forget to record it?');

export const ctxCallOutOfScope = () => new Error('Should not call a context out of the plugin.');

export const createNodeInParserFail = (...args: unknown[]) => {
    const message = args.reduce((msg, arg) => {
        if (!arg) {
            return msg;
        }
        const serialize = (x: unknown): string => {
            if (Array.isArray(x)) {
                return (x as unknown[]).map((y) => serialize(y)).join(', ');
            }
            if ((x as { toJSON(): Record<string, unknown> }).toJSON) {
                return stringify((x as { toJSON(): Record<string, unknown> }).toJSON());
            }

            if ((x as { spec: string }).spec) {
                return stringify((x as { spec: string }).spec);
            }

            return (x as { toString(): string }).toString();
        };
        return `${msg}, ${serialize(arg)}`;
    }, 'Create prosemirror node from remark failed in parser') as string;

    return new Error(message);
};

export const stackOverFlow = () => new Error('Stack over flow, cannot pop on an empty stack.');

export const parserMatchError = (node: unknown) =>
    new Error(`Cannot match target parser for node: ${stringify(node)}.`);

export const serializerMatchError = (node: unknown) =>
    new Error(`Cannot match target serializer for node: ${stringify(node)}.`);

export const getAtomFromSchemaFail = (type: 'mark' | 'node', name: string) =>
    new Error(`Cannot get ${type}: ${name} from schema.`);

export const expectDomTypeError = (node: unknown) => new Error(`Expect to be a dom, but get: ${stringify(node)}.`);

export const callCommandBeforeEditorView = () =>
    new Error(
        `You're trying to call a command before editor view initialized, make sure to get commandManager from ctx after editor view has been initialized`,
    );

export const themeMustInstalled = () =>
    new Error(
        `It seems that no theme found in editor, please make sure you have use theme in front of all plugins.
If you prefer to use an empty theme, you can use \`themeFactory({})\`.`,
    );
