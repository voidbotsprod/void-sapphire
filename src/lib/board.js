import { DB } from '#lib/functions';

/**
 * Board creator for VOID
 */
export default class Board {
	constructor() {
		this.interaction;
		this.type;
		this.guildId;
		this.name;
		this.description;
		this.sizeX;
		this.sizeY;
		this.createdAt;
		this.expireAt;
	}

	/**
	 * Create a new board.
	 * @param {import('discord.js').CommandInteraction} interaction
	 * @param {number} type Board type id
	 * @param {number} guildId Guild id
	 * @param {string} name Board name
	 * @param {string} description Board description
	 * @param {number} sizeX Size X
	 * @param {number} sizeY Size Y
	 * @param {number} expireAt Epoch time
	 */
	async create(interaction, type, guildId, name, description, sizeX, sizeY, expireAt) {
		this.interaction = interaction;
		this.type = type;
		this.guildId = guildId;
		this.name = name;
		this.description = description;
		this.sizeX = sizeX;
		this.sizeY = sizeY;
		this.createdAt = Math.floor(Date.now() / 1000);
		this.expireAt = expireAt;

		let board = await this.getBoard(await this.getBoardTypeIdFromDesc(), guildId, name, sizeX, sizeY);

		if (!board) {
			await DB(`INSERT INTO boards (boardTypeId, guildId, name, description, sizeX, sizeY, createdAt, expireAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
				await this.getBoardTypeIdFromDesc(),
				guildId,
				name,
				description,
				sizeX,
				sizeY,
				this.createdAt,
				expireAt
			]);
			board = await this.getBoard(await this.getBoardTypeIdFromDesc(), guildId, name, sizeX, sizeY);
			board.existed = false;

			client.logger.info(`Saved new board with type '${type}' from guild '${guildId}' with the size of ${sizeX}x${sizeY}, expires at ${expireAt ? expireAt : 'never'}`);
		} else {
			board.existed = true;
			client.logger.info(`Board already exists, creation cancelled.`);
		}

		return board;
	}

	/**
	 * Get board properties of the created board.
	 * @returns {Promise<Board>}
	 * @param {number} boardType
	 * @param {number} guildId
	 * @param {string} name
	 * @param {number} sizeX
	 * @param {number} sizeY
	 */
	async getBoard(boardType, guildId, name, sizeX, sizeY) {
		const board = await DB(`SELECT * FROM boards WHERE boardTypeId = ? AND guildId = ? AND name = ? AND sizeX = ? AND sizeY = ?`, [boardType, guildId, name, sizeX, sizeY]);
		if (!board) return null;

		return board;
	}

	/**
	 * @returns {Promise<number>}
	 * @param {string} boardType
	 */
	async getBoardTypeIdFromDesc() {
		const type = await DB(`SELECT id FROM boardtypes WHERE typeDescription = ?`, [this.type]);
		if (!type) return null;

		return type.id;
	}
}
