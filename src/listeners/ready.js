import { Listener, container } from '@sapphire/framework';
import { blue, gray, green, magenta, magentaBright, white, yellow, redBright, red } from 'colorette';
import mysql from "mysql2";
import { DB } from '#lib/functions';

const environmentType = process.env.NODE_ENV === 'DEVELOPMENT';
const llc = environmentType ? magentaBright : white;
const blc = environmentType ? magenta : blue;
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

export class ReadyEvent extends Listener {
    constructor(context, options = {}) {
        super(context, {
            ...options,
            once: true,
            event: 'ready'
        });
    }

    async run() {
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

        global.dbPool = pool.promise();
        global.guildLanguages = [];
        global.languageList = [];

        try {
            const startTime = Date.now()
            for (const guild of client.guilds.cache) {
                const lang = await DB(`SELECT * FROM guilds WHERE Id = ?`, [guild[0]]);
                const languageId = await lang ? 1 : await lang.LanguageId;

                guildLanguages.push({
                    guildId: guild[0],
                    languageId: languageId
                })
            }
            const endTime = Date.now()
            client.logger.info(String.raw`Loaded ${green("language")} cache in ${green(endTime - startTime + "ms")}.`.trim());
        } catch (error) {
            console.log(error)
        }

        try {
            const [langQuery] = await DB(`SELECT * FROM languages`, [], true);
            languageList = await langQuery;
        } catch (error) {
            console.log(error)
        }

        this.printBanner();
        this.printStoreDebugInformation();
        await this.setStatus();
    }

    async setStatus() {
        await client.user.setActivity('/help', { type: 'WATCHING' })
    }

    async printBanner() {
        client.logger.info(`[${green('+')}] Gateway online\n${environmentType ? `${blc('</>') + llc(` ${process.env.NODE_ENV} ENVIRONMENT`)}` : 'PRODUCTION ENVIRONMENT'}\n${llc(`v${process.env.VERSION}`)}`.trim());

        const connectionSuccess = `Connected to database ${green(process.env.DB_NAME)} on ${llc(process.env.DB_HOST)}:${blc(process.env.DB_PORT)}`;
        const connectionFailure = `Failed to connect to database ${redBright(process.env.DB_NAME)} on ${redBright(process.env.DB_HOST)}:${red(process.env.DB_PORT)}`;
        const statusString = await dbPool.getConnection().then(() => connectionSuccess).catch(() => connectionFailure);
        this.container.logger.info(statusString)
    }

    printStoreDebugInformation() {
        const { client, logger } = this.container;
        const stores = [...client.stores.values()];
        const first = stores.shift();
        const last = stores.pop();

        logger.info(this.styleStore(first, '┌─'));
        for (const store of stores) logger.info(this.styleStore(store, '├─'));
        logger.info(this.styleStore(last, '└─'));
    }

    /**
     * Adds a symbol before a loaded store.
     * @param {Store} store The store that got loaded.
     * @param {string} prefix The symbol to show before the loaded store. 
     * @returns {string} The styled string to print.
     */
    styleStore(store, prefix) {
        const style = environmentType ? yellow : blue;
        return gray(`${prefix} Loaded ${style(store.size.toString().padEnd(3, ' '))} ${store.name}.`);
    }
}
