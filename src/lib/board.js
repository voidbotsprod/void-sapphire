import { DB } from '#lib/functions';

/**
 * Board creator for VOID
 */
export default class Board {
    constructor() {
        this.interaction;
        this.type;
        this.guildId;
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
     * @param {number} sizeX Size X
     * @param {number} sizeY Size Y
     * @param {number} expireAt Epoch time
     */
    async create(interaction, type, guildId, sizeX, sizeY, expireAt) {
        this.interaction = interaction;
        this.type = type;
        this.guildId = guildId;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.createdAt = Date.now();
        this.expireAt = expireAt;

        let board = await this.getBoard();
        if (!board) {
            await DB(
                `INSERT INTO boards (boardTypeId, guildId, sizeX, sizeY, createdAt, expireAt) VALUES (?, ?, ?, ?, ?, ?)`,
                [await this.boardTypeId(), this.guildId, this.sizeX, this.sizeY, this.createdAt, this.expireAt]
            );
            board = await this.getBoard();
            board.existed = false;

            client.logger.info(`Saved new board with type '${this.type}' from guild '${this.guildId}' with the size of ${this.sizeX}x${this.sizeY}, expires at ${this.expireAt ? this.expireAt : 'never'}`);
        } else {
            board.existed = true;
            client.logger.info(`Board already exists, creation cancelled.`);
        }

        return board;
    }

    /**
     * Get board properties of the created board.
     * @returns {Promise<Board>}
     */
    async getBoard() {
        const board = await DB(
            `SELECT * FROM boards WHERE boardTypeId = ? AND guildId = ? AND sizeX = ? AND sizeY = ?`,
            [await this.boardTypeId(), this.guildId, this.sizeX, this.sizeY]
        );
        if (!board) return null;

        return board;
    }

    /**
     * @returns {Promise<number>}
     */
    async boardTypeId() {
        const type = await DB(
            `SELECT id FROM boardtypes WHERE typeDescription = ?`,
            [this.type]
        );
        if (!type) return null;

        return type.id;
    }
}