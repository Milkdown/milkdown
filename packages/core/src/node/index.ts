import { Paragraph } from './paragraph';
import { Blockquote } from './blockquote';
import { Heading } from './heading';
import { Image } from './image';
import { Hr } from './hr';
import { BulletList } from './bullet-list';
import { ListItem } from './list-item';
import { OrderedList } from './ordered-list';
import { HardBreak } from './hard-break';
import { CodeFence } from './code-fence';

export const nodes = [
    Paragraph,
    HardBreak,
    Blockquote,
    CodeFence,
    OrderedList,
    BulletList,
    ListItem,
    Heading,
    Hr,
    Image,
];
