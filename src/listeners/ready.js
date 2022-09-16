import { Listener, container } from '@sapphire/framework';
import { Time } from "@sapphire/time-utilities";
import { blue, gray, green, magenta, magentaBright, white, yellow, redBright, red } from 'colorette';

const environmentType = process.env.NODE_ENV === 'DEVELOPMENT';
const llc = environmentType ? magentaBright : white;
const blc = environmentType ? magenta : blue;

export class ReadyEvent extends Listener {

    constructor(context, options = {}) {
        super(context, {
            ...options,
            once: true
        });
    }

    async run() {
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

        this.printBanner();
        this.printStoreDebugInformation();
        await this.setStatus();
    }

    /**
     * Sets the bot's status.
     */
    async setStatus() {
        // Change the status every 60s because it can reset whenever discord feels like it
        // Uncomment the setTimeout below to change the status, if the default online isnt what we settle on
        /* setTimeout(() => {
            client.user.setStatus('dnd'); // dnd, idle, online, invisible
        }, Time.Second * 60); */
        await client.user.setActivity('/help', { type: 'WATCHING' })
    }

    /**
     * Prints a magenta (DEVELOPMENT) or blue (PRODUCTION) info banner depending on the NODE_ENV.
    */
    printBanner() {
        client.logger.info(String.raw`
[${green('+')}] Gateway online
${environmentType ? `${blc('</>') + llc(` ${process.env.NODE_ENV} ENVIRONMENT`)}` : 'PRODUCTION ENVIRONMENT'}
${llc(`v${process.env.VERSION}`)}`.trim()
        );
    }

    /**
     * Prints the loaded stores.
    */
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
     * Helper function for styling the store name.
     */
    style = environmentType ? yellow : blue;

    /**
     * Adds a symbol before a loaded store.
     * @param {Store} store The store that got loaded.
     * @param {string} prefix The symbol to show before the loaded store. 
     * @returns {string} The styled string to print.
     */
    styleStore(store, prefix) {
        return gray(`${prefix} Loaded ${this.style(store.size.toString().padEnd(3, ' '))} ${store.name}.`);
    }
}
