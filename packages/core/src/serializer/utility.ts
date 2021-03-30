export class Utility {
    /**
     * Escape the given string so that it can safely appear in Markdown content.
     *
     * @param str The string to be escaped.
     * @param startOfLine Whether escape characters that have special meaning at the start of the line.
     * @returns Escaped string.
     */
    static escape(str: string, startOfLine?: boolean) {
        let output = str.replace(/[`*\\~[\]]/g, '\\$&');
        if (startOfLine) {
            output = output.replace(/^[:#\-*+]/, '\\$&').replace(/^(\d+)\./, '$1\\.');
        }

        return output;
    }

    static quote(str: string) {
        const wrap = str.indexOf('"') === -1 ? '""' : str.indexOf("'") === -1 ? "''" : '()';
        return wrap[0] + str + wrap[1];
    }

    static repeat(str: string, n: number) {
        return Array(n)
            .fill(str)
            .reduce((acc, cur) => acc + cur, '');
    }

    static getEnclosingWhitespace(text: string) {
        return {
            leading: (text.match(/^(\s+)/) || [])[0],
            trailing: (text.match(/(\s+)$/) || [])[0],
        };
    }

    static removeWhiteSpaceAfter(str: string) {
        const lastNSpace = /\s+$/;
        const result = lastNSpace.exec(str);
        return result ? str.slice(0, result.index) : str;
    }
}
