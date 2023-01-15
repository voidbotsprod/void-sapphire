import { Listener, container } from '@sapphire/framework';
import { blue, gray, green, magenta, magentaBright, white, yellow, redBright, red } from 'colorette';

const environmentType = process.env.NODE_ENV === 'DEVELOPMENT';
const llc = environmentType ? magentaBright : white;
const blc = environmentType ? magenta : blue;

export class ReadyEvent extends Listener {
	constructor(context, options = {}) {
		super(context, {
			...options,
			once: true,
			event: 'ready'
		});
	}

	async run() {
		this.printBanner();
		this.printStoreDebugInformation();
		await this.setStatus();
	}

	async setStatus() {
		await client.user.setActivity('/help', { type: 'WATCHING' });
	}

	async printBanner() {
		client.logger.info(
			`[${green('+')}] Gateway online\n${environmentType ? `${blc('</>') + llc(` ${process.env.NODE_ENV} ENVIRONMENT`)}` : 'PRODUCTION ENVIRONMENT'}\n${llc(`v${process.env.VERSION}`)}`.trim()
		);

		const connectionSuccess = `Connected to database ${green(process.env.DB_NAME)} on ${llc(process.env.DB_HOST)}:${blc(process.env.DB_PORT)}`;
		const connectionFailure = `Failed to connect to database ${redBright(process.env.DB_NAME)} on ${redBright(process.env.DB_HOST)}:${red(process.env.DB_PORT)}`;
		const statusString = await dbPool
			.getConnection()
			.then(() => connectionSuccess)
			.catch(() => connectionFailure);
		this.container.logger.info(statusString);
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
