import { Listener, container } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { blue, gray, green, magenta, magentaBright, white, yellow, redBright, red } from 'colorette';
import { DB } from '#lib/functions';
import { Worker } from 'worker_threads';
import path from 'path';

export class ReadyEvent extends Listener {
	constructor(context, options = {}) {
		super(context, {
			...options,
			once: true,
			event: 'ready'
		});
	}

	async run() {
		// Summon new worker
		const worker = new Worker(path.resolve(process.cwd(), 'src/lib/worker.js'));
		// Request an update every 30 seconds
		setInterval(async () => {
			await this.requestUpdate(worker);
		}, Time.Second * 10);
		// Listen for worker messages
		worker.on('message', (message) => {
			if (!message.success) client.logger.error(`${red("Failed")} to cache board ${gray(message.path)}.`);
		});
	}

	async requestUpdate(worker) {
		// Ask the worker to cache all boards
		const board = await DB('SELECT * FROM boards', [], true)
		const pixels = await DB('SELECT * FROM pixelplacements', [], true)
		const colors = await DB('SELECT * FROM colors', [], true)

		board[0].forEach(async (board) => {
			const boardPixels = pixels[0].filter((pixel) => pixel.GuildId === board.GuildId && pixel.BoardId === board.Id);
			await worker.postMessage({ board: board, pixels: boardPixels, colors: colors });
		});
	}
}
