import { Command, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { capitalize } from '#lib/functions';
import { EmbedBuilder } from 'discord.js';
import languagePassthrough from '#lib/functions';
import getBoard from '#lib/board';

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
				builder.setName(this.name).setDescription(this.description);
			},
			{
				guildIds: ['975124858298040451'] // guilds for the command to be registered in; global if empty
				// idHints: '1018626871690268742' // commandId, define after registering (id will be in log after first run)
			}
		);
	}

	async chatInputRun(interaction) {
		// send board, attach buttons
		let board = await getBoard(interaction, 'void', interaction.guild.id, interaction.guild.name, 15, 15, 0);

		const embed = new EmbedBuilder()
			.setColor('RANDOM')
			.setTitle(languagePassthrough(interaction, 'void.title', { '%GUILD_NAME%': interaction.guild.name })) // Board for %GUILD_NAME%
			.setImage(board);

		const buttons = [
			{
				type: 2,
				style: 1,
				label: capitalize(languagePassthrough(interaction, 'void.buttons.left_15')), // <- 15
				customId: 'left_15'
			},
			{
				type: 2,
				style: 1,
				label: capitalize(languagePassthrough(interaction, 'void.buttons.left_5')), // <- 5
				customId: 'left_5'
			},
			{
				type: 2,
				style: 1,
				label: capitalize(languagePassthrough(interaction, 'void.buttons.left_1')), // <- 1
				customId: 'left_1'
			},
			{
				type: 2,
				style: 1,
				label: capitalize(languagePassthrough(interaction, 'void.buttons.place_pixel')), // Place Pixel
				customId: 'place_pixel'
			},
			{
				type: 2,
				style: 1,
				label: capitalize(languagePassthrough(interaction, 'void.buttons.right_1')), // 1 ->
				customId: 'right_1'
			},
			{
				type: 2,
				style: 1,
				label: capitalize(languagePassthrough(interaction, 'void.buttons.right_5')), // 5 ->
				customId: 'right_5'
			},
			{
				type: 2,
				style: 1,
				label: capitalize(languagePassthrough(interaction, 'void.buttons.right_15')), // 15 ->
				customId: 'right_15'
			}
		];

		await interaction.reply({ embeds: [embed], components: [{ type: 1, components: buttons }] });

		// wait for button click
		const filter = (i) => i.user.id === interaction.user.id;
		const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

		collector.on('collect', async (i) => {
			switch (i.customId) {
				case 'left_15':
					// move board left 15
					break;
				case 'left_5':
					// move board left 5
					break;
				case 'left_1':
					// move board left 1
					break;
				case 'right_1':
					// move board right 1
					break;
				case 'right_5':
					// move board right 5
					break;
				case 'right_15':
					// move board right 15
					break;
				case 'place_pixel':
					// place pixel
					break;
			}
		});

		collector.on('end', async (collected) => {
			if (collected.size === 0) {
				await interaction.editReply({ content: 'Timed out.', components: [] });
			}
		});
	}
}
