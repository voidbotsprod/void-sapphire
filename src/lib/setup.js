import 'dotenv/config';
import '@sapphire/plugin-api/register';
import '@sapphire/plugin-logger/register';

import { createColors } from 'colorette';
import { inspect } from 'node:util';
import { container } from '@sapphire/framework';

import mysql from 'mysql2';
import { DB } from '#lib/functions';

// Set default inspection depth
inspect.defaultOptions.depth = 1;

// Enable colorette
createColors({ useColor: true });

//#region Setup DB
const pool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	port: process.env.DB_PORT,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
});
//#endregion

//#region Setup Languages

//#endregion

//#region Container Constants and global vars
global.dbPool = pool.promise();
global.guildLanguages = [];
global.languageList = [];
global.itemList = [];
global.colorList = [];
global.rarityList = [];

container.color = {
	PASTEL_GREEN: 0x87de7f,
	CHERRY_RED: 0x8e3741,
	BLURPLE: 0x5865f2,
	BLURPLE_CLASSIC: 0x7289da,
	GREYPLE: 0x99aab5,
	DARK_BUT_NOT_BLACK: 0x2c2f33,
	NOT_QUITE_BLACK: 0x23272a
};

container.emoji = {
	POSITIVE: '<:positive:1017154150464753665>',
	NEGATIVE: '<:negative:1017154192525250590>',
	NEUTRAL: '<:neutral:1017154199735259146>'
};
//#endregion
