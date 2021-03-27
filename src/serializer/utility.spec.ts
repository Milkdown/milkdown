import { Utility } from './utility';

test('.escape', () => {
    expect(Utility.escape('*abc*')).toBe('\\*abc\\*');
    expect(Utility.escape('#*abc*')).toBe('#\\*abc\\*');
    expect(Utility.escape('#*abc*', true)).toBe('\\#\\*abc\\*');
    expect(Utility.escape('#\n#*abc*', true)).toBe('\\#\n#\\*abc\\*');
});

test('.quote', () => {
    expect(Utility.quote('abc')).toBe('"abc"');
    expect(Utility.quote('a"bc')).toBe(`'a"bc'`);
    expect(Utility.quote(`a"b'c`)).toBe(`(a"b'c)`);
});

test('.repeat', () => {
    expect(Utility.repeat('abc', 3)).toBe('abcabcabc');
});

test('.getEnclosingWhitespace', () => {
    expect(Utility.getEnclosingWhitespace('abc')).toEqual({
        leading: undefined,
        trailing: undefined,
    });

    expect(Utility.getEnclosingWhitespace(' abc  ')).toEqual({
        leading: ' ',
        trailing: '  ',
    });

    expect(Utility.getEnclosingWhitespace(' a\nbc  ')).toEqual({
        leading: ' ',
        trailing: '  ',
    });
});

test('.removeWhiteSpaceAfter', () => {
    expect(Utility.removeWhiteSpaceAfter('abc')).toEqual('abc');
    expect(Utility.removeWhiteSpaceAfter(' abc  ')).toEqual(' abc');
});
