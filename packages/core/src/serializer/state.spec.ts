import { Node } from 'prosemirror-model';
import { State } from './state';

test('.ensureNewLine', () => {
    const state = new State({}, {});
    state.ensureNewLine();
    expect(state.output).toBe('');

    state.write('abc').ensureNewLine();
    expect(state.output).toBe('abc\n');

    state.ensureNewLine();
    expect(state.output).toBe('abc\n');
});

test('.closeBlock', () => {
    const state = new State({}, {});
    const node = new Node();
    state.write();
    expect(state.output).toBe('');
    state.closeBlock(node).write();
    expect(state.output).toBe('\n');
});

test('.write', () => {
    const state = new State({}, {});
    state.write('abc');
    expect(state.output).toBe('abc');
});

describe('wrapBlock', () => {
    test('no firstDelimitation', () => {
        const state = new State({}, {});
        state.wrapBlock('>> ', new Node(), () => {
            state.write('abc');
        });
        expect(state.output).toBe('>> abc');
    });

    test('with firstDelimitation', () => {
        const state = new State({}, {});
        state.wrapBlock(
            '>> ',
            new Node(),
            () => {
                state.ensureNewLine().write('abc');
            },
            ':prefix:',
        );
        expect(state.output).toBe(':prefix:\n>> abc');
    });
});
