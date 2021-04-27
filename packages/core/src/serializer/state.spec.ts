import { Node } from 'prosemirror-model';
import { State } from './state';

type StateParams = ConstructorParameters<typeof State>;

type Params = {
    stateParams?: StateParams;
};

const setup = (params: Params = {}) => {
    const state = new State(...(params.stateParams ?? [{}, {}]));
    const getClose = () => ((state as unknown) as Record<string, boolean | Node>).closed;
    const setDelimitation = (delimitation: string) => {
        ((state as unknown) as Record<string, string>).delimitation = delimitation;
        return state;
    };
    const setOutput = (out: string) => {
        ((state as unknown) as Record<string, string>).out = out;
        return state;
    };
    const resetClose = () => {
        state.closeBlock((false as unknown) as Node);
        return state;
    };

    return {
        state,
        getClose,
        resetClose,
        setOutput,
        setDelimitation,
    };
};

test('.ensureNewLine', () => {
    const { state, setOutput } = setup();
    state.ensureNewLine();
    expect(state.output).toBe('');

    setOutput('abc');
    state.ensureNewLine();
    expect(state.output).toBe('abc\n');

    state.ensureNewLine();
    expect(state.output).toBe('abc\n');
});

test('.closeBlock', () => {
    const { state, getClose } = setup();
    const node = new Node();
    state.closeBlock(node);
    expect(getClose()).toBe(node);
});

test('.flushClose', () => {
    const { state, setOutput, getClose, setDelimitation } = setup();

    state.flushClose();
    expect(state.output).toBe('');

    setOutput('abc').flushClose();
    expect(state.output).toBe('abc');

    state.closeBlock(new Node()).flushClose();
    expect(state.output).toBe('abc\n\n');
    expect(getClose()).toBeFalsy();

    setOutput('abc\n').closeBlock(new Node()).flushClose();
    expect(state.output).toBe('abc\n\n');
    expect(getClose()).toBeFalsy();

    setDelimitation('>  ');
    setOutput('abc\n').closeBlock(new Node()).flushClose(2);
    expect(state.output).toBe('abc\n>\n>\n');
    expect(getClose()).toBeFalsy();
});

test('.write', () => {
    const { state, setOutput, setDelimitation } = setup();
    setOutput('abc').write();
    expect(state.output).toBe('abc');

    setDelimitation('>  ');
    state.write();
    expect(state.output).toBe('abc');

    state.write('\n');
    expect(state.output).toBe('abc\n');

    state.write();
    expect(state.output).toBe('abc\n');

    state.write('de');
    expect(state.output).toBe('abc\n>  de');
});

test('.text', () => {
    const { state, setDelimitation, setOutput, resetClose } = setup();
    state.text('abc');
    expect(state.output).toBe('abc');

    setDelimitation('> ');
    resetClose();
    setOutput('').text('abc\ndef\nfoo');

    expect(state.output).toBe('> abc\n> def\n> foo');

    setDelimitation('');
    resetClose();
    setOutput('').text('*abc*');
    expect(state.output).toBe('*abc*');

    setDelimitation('');
    resetClose();
    setOutput('').text('*abc*', true);
    expect(state.output).toBe('\\*abc\\*');
});

test('.wrapBlock', () => {
    const { state, setOutput, setDelimitation, resetClose } = setup();

    state.wrapBlock('> ', new Node(), () => void 0);

    expect(state.output).toBe('> ');

    setDelimitation('');
    resetClose();
    setOutput('').wrapBlock(
        '> ',
        new Node(),
        () => {
            state.text('abc\ndef\nfoo');
        },
        '$ ',
    );

    expect(state.output).toBe('$ abc\n> def\n> foo');
});

test('.renderInline', () => {
    const { state } = setup();
    const node = {} as Node;
    const contents = [] as Node[];
    node.forEach = (callback) => {
        contents.forEach((content, i) => {
            callback(content, 0, i);
        });
    };
    contents.push({
        isText: true,
        text: 'inline text',
    } as Node);
    state.renderInline(node);

    expect(state.output).toBe('inline text');
});
