import { DB } from '#lib/functions';
import { createCanvas, loadImage } from '@napi-rs/canvas';

export default class Board {
	constructor(id, type, guildId, name, description, sizeX, sizeY, createdAt, expireAt) {
		this.id = id;
		this.type = type;
		this.guildId = guildId;
		this.name = name;
		this.description = description;
		this.sizeX = sizeX;
		this.sizeY = sizeY;
		this.createdAt = createdAt;
		this.expireAt = expireAt;
	}

	static async create(type, guildId, name, description, sizeX, sizeY, expireAt) {
		let board = new Board(data.Id, type, guildId, name, description, sizeX, sizeY, Math.floor(Date.now() / 1000), expireAt);

		if (board.exists()) {
			return null;
		} else {
			await DB(`INSERT INTO boards (boardTypeId, guildId, name, description, sizeX, sizeY, createdAt, expireAt) VALUES (?, ?, ?, ?, ?, ?, now(), ?)`, [
				type,
				guildId,
				name,
				description,
				sizeX,
				sizeY,
				expireAt
			]);
			global.client.logger.info(`Saved new board with type '${type}' from guild '${guildId}' with the size of ${sizeX}x${sizeY}, expires ${expireAt ? 'at ' + expireAt : 'never'}`);
		}

		return board;
	}

	static async getExact(boardType, guildId, name, sizeX, sizeY) {
		const data = await DB(`SELECT * FROM boards WHERE boardTypeId = ? AND guildId = ? AND name = ? AND sizeX = ? AND sizeY = ?`, [boardType, guildId, name, sizeX, sizeY]);

		if (data) {
			return new Board(data.Id, data.BoardTypeId, data.GuildId, data.Name, data.Description, data.SizeX, data.SizeY, data.CreatedAt, data.ExpireAt);
		} else {
			return null;
		}
	}

	static async getByName(guildId, name) {
		const data = await DB(`SELECT * FROM boards WHERE guildId = ? AND name = ?`, [guildId, name]);

		return new Board(data.Id, data.BoardTypeId, data.GuildId, data.Name, data.Description, data.SizeX, data.SizeY, data.CreatedAt, data.ExpireAt);
	}

	static async getById(id) {
		const data = await DB(`SELECT * FROM boards WHERE id = ?`, [id]);
		return new Board(data.Id, data.BoardTypeId, data.GuildId, data.Name, data.Description, data.SizeX, data.SizeY, data.CreatedAt, data.ExpireAt);
	}

	async exists() {
		const data = await DB(`SELECT * FROM boards WHERE guildId = ? AND name = ?`, [this.guildId, this.name]);
		return data ? true : false;
	}

	// @tim: replace true/false with error codes
	async placePixel(x, y, color, userId) {
		console.log(`placing pixel at ${x}, ${y} with color ${color} and userId ${userId}`);
		const pixel = await DB(`SELECT * FROM pixelplacements WHERE boardId = ? AND xPosition = ? AND yPosition = ?`, [this.id, x, y]);

		// check if out of bounds
		if (x > this.sizeX || y > this.sizeY) {
			console.log(`out of bounds`);
			return false;
		}

		// if pixel exists, update it
		if (pixel) {
			console.log(`update`);
			await DB(`UPDATE pixelplacements SET ColorId = ?, userId = ? WHERE id = ?`, [color, userId, pixel.Id]);
			return true;
		} else { // if pixel doesn't exist, create it
			console.log(`create`);
			await DB(`INSERT INTO pixelplacements (boardId, userId, guildId, xPosition, yPosition, color, placedAt) VALUES (?, ?, ?, ?, ?, ?, now())`, [this.id, userId, this.guildId, x, y, color]);
			return true;
		}
	}

	async getImage() {
		const pixels = await await dbPool.execute(`SELECT * FROM pixelplacements WHERE boardId = ?`, [this.id]);

		const canvas = createCanvas(this.sizeX * 100, this.sizeY * 100);
		const ctx = canvas.getContext('2d');
		ctx.fillStyle = `rgb(255, 255, 255)`;

		for (let i = 0; i < pixels[0].length; i++) {
			const pixel = pixels[0][i];
			ctx.fillStyle = await DB(`SELECT Value FROM colors WHERE id = ?`, [pixel.ColorId]).then((data) => data.Value);
			ctx.fillRect(pixel.XPosition * 100 - 100, pixel.YPosition * 100 - 100, 100, 100);
		}

		let attachment = canvas.toBuffer();

		return {
			attachment: attachment,
			name: 'board.png'
		};
	}

	// fills the board with random pixels
	async test(sizeX, sizeY) {
		await dbPool.execute(`delete from pixelplacements where boardId = 19`);

		let colorData = await dbPool.execute(`select * from colors`);
		let colors = [];
		for (let i = 0; i < colorData[0].length; i++) {
			colors.push(colorData[0][i].Id);
		}

		let iterations = sizeX > sizeY ? sizeX : sizeY;
		console.log('iterations:', iterations);

		for (let i = 1; i <= iterations; i++) {
			for (let j = 1; j <= iterations; j++) {
				console.log('test:', i, j);
				await dbPool.execute(`insert into pixelplacements (boardId, userId, guildId, xPosition, yPosition, colorId, placedAt) values (19, '1', 975124858298040451, ?, ?, ?, now())`, [
					i,
					j,
					colors[Math.floor(Math.random() * colors.length)]
				]);
			}
		}
	}
}
