import 'dotenv/config';
import '@sapphire/plugin-api/register';
import '@sapphire/plugin-logger/register';

import { createColors } from 'colorette';
import { inspect } from 'node:util';
import { container } from '@sapphire/framework';


// Set default inspection depth
inspect.defaultOptions.depth = 1;

// Enable colorette
createColors({ useColor: true });

container.color = {
    PASTEL_GREEN: 0x87de7f,
    CHERRY_RED: 0x8e3741,
    BLURPLE: 0x5865F2,
    BLURPLE_CLASSIC: 0x7289DA,
    GREYPLE: 0x99AAB5,
    DARK_BUT_NOT_BLACK: 0x2C2F33,
    NOT_QUITE_BLACK: 0x23272A
}

container.emoji = {
    POSITIVE: '<:positive:1017154150464753665>',
    NEGATIVE: '<:negative:1017154192525250590>',
    NEUTRAL: '<:neutral:1017154199735259146>'
}