import { blockquote } from './blockquote';
import { codeFence } from './code-fence';
import { doc } from './doc';
import { paragraph } from './paragraph';
import { text } from './text';

export const nodes = [doc(), paragraph(), blockquote(), codeFence(), text()];
