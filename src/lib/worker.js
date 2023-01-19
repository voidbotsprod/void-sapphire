import { parentPort } from 'worker_threads';
import { createCanvas } from '@napi-rs/canvas';
import * as fs from 'fs';
import lru from 'lru-cache';

const cache = new lru({ max: 500 });

parentPort.on('message', async (message) => {
	// Deconstruct message
	const msgBoard = message.board;
	const msgPixels = message.pixels;
	const msgColors = message.colors;
	const dirName = msgBoard.BoardTypeId === 1 ? `${msgBoard.BoardTypeId}_${msgBoard.Id}` : `${msgBoard.BoardTypeId}_${msgBoard.Id}_${msgBoard.GuildId}`;

	try {
		// Check if there are any changes in pixels
		let changes = false;
		if (!cache.get(`${msgBoard.BoardTypeId}_${msgBoard.Id}`)) {
			cache.set(`${msgBoard.BoardTypeId}_${msgBoard.Id}`, msgPixels);
			changes = true;
		} else {
			if (JSON.stringify(msgPixels) !== JSON.stringify(cache.get(`${msgBoard.BoardTypeId}_${msgBoard.Id}`))) {
				cache.set(`${msgBoard.BoardTypeId}_${msgBoard.Id}`, msgPixels);
				changes = true;
			}
		}
		// If there are changes, create the canvas and write to file
		if (changes) {
			// Create canvas
			const canvas = createCanvas(msgBoard.SizeX, msgBoard.SizeY);
			const ctx = canvas.getContext('2d');
			ctx.quality = 'fast';
			ctx.fillStyle = '#FFFFFF';
			ctx.fillRect(0, 0, msgBoard.SizeX, msgBoard.SizeY);
			// Draw pixels
			msgPixels.forEach((pixel) => {
				if (pixel.GuildId === msgBoard.GuildId) {
					const color = msgColors[0].find((color) => color.Id === pixel.ColorId);
					ctx.fillStyle = color.Value;
					ctx.fillRect(pixel.XPosition, pixel.YPosition, 1, 1);
				}
			});
			// Create directory if it doesn't exist
			const basePath = 'src/boardCache';
			const guildIdPath = `src/boardCache/${dirName}`;
			if (!fs.existsSync(basePath)) fs.mkdirSync(basePath);
			if (!fs.existsSync(guildIdPath)) fs.mkdirSync(guildIdPath);
			// Write to file
			const imageData = canvas.toBuffer('image/png');
			const path = `${guildIdPath}/board.png`;
			fs.writeFileSync(path, imageData);
			parentPort.postMessage({ path: path, success: true });
		} else { // If there are no changes, return the previous path
			// if there were no changes, return the previous path
			parentPort.postMessage({ path: `src/boardCache/${dirName}/board.png`, success: true });
		}
	} catch (error) {
		console.log(error);
		parentPort.postMessage({ path: dirName, success: false });
	}
});