import { Command, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { capitalize } from '#lib/functions';
import { EmbedBuilder, strikethrough } from 'discord.js';
import languagePassthrough from '#lib/functions';
import Board from '#lib/board';
import { stripIndent } from 'common-tags';

export class voidCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'void',
			description: "Used to show the guild's board and to place pixels on it.",
			runIn: CommandOptionsRunTypeEnum.GuildText
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) => {
				builder
					.setName(this.name)
					.setDescription(this.description)
					.addIntegerOption((option) => option.setName('x').setDescription('The x coordinate of the pixel.').setRequired(false))
					.addIntegerOption((option) => option.setName('y').setDescription('The y coordinate of the pixel.').setRequired(false))
					.addStringOption((option) => option.setName('color').setDescription('The color of the pixel.').setRequired(false));
			},
			{
				guildIds: ['975124858298040451'] // guilds for the command to be registered in; global if empty
				// idHints: '1018626871690268742' // commandId, define after registering (id will be in log after first run)
			}
		);
	}

	async chatInputRun(interaction) {
		const x = interaction.options.getInteger('x');
		const y = interaction.options.getInteger('y');
		const color = interaction.options.getString('color');

		const board = await Board.getById(19);

		if (x && y && color) return this.placePixel(interaction, board, x, y, color);
		if (x && y) return this.showBoard(interaction, board, x, y);
		return this.showBoard(interaction, board);
	}

	async placePixel(interaction, board, x, y, color) {
		const pixel = await board.placePixel(x, y, color, interaction.user.id);
		if (!pixel) return interaction.reply("You can't place a pixel out of bounds. Try again!");
		return this.showBoard(interaction, board, x, y);
	}

	async showBoard(interaction, board, x = 0, y = 0) {
		let attachment = await board.getImage();

		return interaction.reply({
			content: stripIndent`**${board.name}** (${board.sizeX}x${board.sizeY})`,
			files: [attachment]
		});
	}
}
