import type Token from 'markdown-it/lib/token';
import type { Schema } from 'prosemirror-model';
import type { TokenHandler } from './types';
import type { Stack } from './stack';

export class State {
    constructor(
        public readonly stack: Stack,
        private readonly schema: Schema,
        private readonly tokenHandlers: Record<string, TokenHandler>,
    ) {}

    parseTokens(tokens: Token[]) {
        tokens.forEach((token, i) => {
            const handler = this.tokenHandlers[token.type];
            if (!handler) throw new Error('Token type `' + token.type + '` not supported by Markdown parser');
            handler(this, token, tokens, i);
        });
    }

    addText(text: string) {
        if (!text) return;

        this.stack.addText((marks) => this.schema.text(text, marks));
    }

    transformTokensToDoc(tokens: Token[]) {
        this.parseTokens(tokens);
        return this.stack.build();
    }
}
