import { parentPort } from 'worker_threads';
import { createCanvas } from '@napi-rs/canvas';
import * as fs from 'fs';

parentPort.on('message', async (message) => {
	// Deconstruct message
	const msgBoard = message.board;
	const msgPixels = message.pixels;
	const msgColors = message.colors;
	const dirName = msgBoard.BoardTypeId === 1 ? `${msgBoard.BoardTypeId}_${msgBoard.Id}` : `${msgBoard.BoardTypeId}_${msgBoard.Id}_${msgBoard.GuildId}`;
	try {
		// Create canvas
		const canvas = createCanvas(msgBoard.SizeX, msgBoard.SizeY);
		const ctx = canvas.getContext('2d');
		ctx.quality = 'fast';
		ctx.fillStyle = '#FFFFFF';
		ctx.fillRect(0, 0, msgBoard.SizeX, msgBoard.SizeY);
		// Draw pixels
		msgPixels[0].forEach((pixel) => {
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
		console.log("Cached board " + dirName);
		parentPort.postMessage({ path: path, success: true });
	} catch (error) {
		console.log(error);
		parentPort.postMessage({ path: dirName, success: false })
	}
});