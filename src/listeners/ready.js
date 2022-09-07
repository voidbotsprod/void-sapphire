import { Listener } from '@sapphire/framework';
import { blue, gray, green, magenta, magentaBright, white, yellow } from 'colorette';

const dev = process.env.NODE_ENV === 'DEVELOPMENT';

export class UserEvent extends Listener {
    style = dev ? yellow : blue;

    constructor(context, options = {}) {
        super(context, {
            ...options,
            once: true
        });
    }

    run() {
        this.printBanner();
        this.printStoreDebugInformation();
    }

    
    /**
     * Prints a magenta (DEVELOPMENT) or blue (PRODUCTION) info banner depending on the NODE_ENV.
    */
    printBanner() {
        const success = green('+');

        const llc = dev ? magentaBright : white;
        const blc = dev ? magenta : blue;

        const line01 = llc('');
        const line02 = llc('');
        const line03 = llc('');

        // Offset Pad
        const pad = ' '.repeat(7);

        console.log(
            String.raw`
${line01} ${pad}${blc(process.env.VERSION)}
${line02} ${pad}[${success}] Gateway
${line03}${dev ? ` ${pad}${blc('<')}${llc('/')}${blc('>')} ${llc(`${process.env.NODE_ENV} MODE`)}` : ''}
		`.trim()
        );
    }

    /**
     * Prints the loaded stores.
    */
    printStoreDebugInformation() {
        const { client, logger } = this.container;
        let stores = [...client.stores.values()];
        let first = stores.shift();
        let last = stores.pop();

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
        return gray(`${prefix} Loaded ${this.style(store.size.toString().padEnd(3, ' '))} ${store.name}.`);
    }
}
