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
    new Paragraph(),
    new HardBreak(),
    new Blockquote(),
    new CodeFence(),
    new OrderedList(),
    new BulletList(),
    new ListItem(),
    new Heading(),
    new Hr(),
    new Image(),
];
