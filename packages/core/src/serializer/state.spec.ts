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
    state.closeBlock(node).write();
    expect(state.output).toBe('\n');
});

test('.write', () => {
    const state = new State({}, {});
    state.write('abc');
    expect(state.output).toBe('abc');
});
