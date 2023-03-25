import { Command, container } from '@sapphire/framework';
import Board from '#lib/board';
import parse from 'parse-duration';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import languagePassthrough from '#lib/languagePassthrough';

export class CreateVoid extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'CreateVoid',
			description: 'Create a new void.',
			preconditions: ['modOnly']
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) => {
				builder
					.setName(this.name)
					.setDescription(this.description)
					.addStringOption((option) => option.setName('name').setDescription('VOID name.').setRequired(true))
					.addStringOption((option) => option.setName('description').setDescription('VOID description.').setRequired(true))
					.addStringOption((option) => {
						option.setName('size').setDescription('The size of your VOID.').setRequired(true);

						const sizes = {
							1: 'Small (21x21px)',
							2: 'Medium (44x44px)',
							3: 'Large (88x88px)',
							4: 'XL (120x120px)',
							5: 'VIP - XXL (192x192px)',
							6: 'VIP - XXXL (240x240px)'
						};

						for (const [id, name] of Object.entries(sizes)) {
							option.addChoices({ name: name, value: id });
						}

						return option;
					})
					.addStringOption((option) => option.setName('expires').setDescription('VOID expiration time. (1h/d/w/y)').setRequired(false))
			},
			{
				guildIds: ['975124858298040451'], // guilds for the command to be registered in; global if empty
				idHints: '1088583257941082123' // commandId, define after registering (id will be in log after first run)
			}
		);
	}

	async chatInputRun(interaction) {
		const sizePresets = {
			1: 21,
			2: 44,
			3: 88,
			4: 120,
			5: 192,
			6: 240
		};

		const name = interaction.options.getString('name');
		const desc = interaction.options.getString('description');
		const size = interaction.options.getString('size');
		const expiration = interaction.options.getString('expires');

		// Get the appropriate quad size for the board size
		const quadOptions = this.calcQuads(sizePresets[size]);
		// Assemble buttons depending on the amount of quads
		const row = new ActionRowBuilder();
		for (let i = 0; i < quadOptions.length; i++) {
			row.addComponents(
				new ButtonBuilder()
					.setCustomId("quad" + quadOptions[i])
					.setLabel(quadOptions[i].toString())
					.setStyle(ButtonStyle.Secondary)
			);
		}
		// Initial reply
		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(container.color.BLURPLE_CLASSIC)
					.setDescription("How many quadrants do you want your board to have?\n<Insert better explanation here>")
					.setFooter({ text: interaction.user.tag, iconUrl: interaction.user.avatarURL() })
					.setTimestamp()
			],
			components: [row]
		});
		// Button collection
		const filter = i => i.customId.startsWith('quad') && i.user.id === interaction.user.id;
		const btnCollector = interaction.channel.createMessageComponentCollector({ filter, time: 30_000 });
		// Create the board and send confirmation
		btnCollector.on('collect', async i => {
			// Get selected quad
			const quadCount = parseInt(i.customId.replace('quad', ''));
			// Attempt to create a board with complete info
			const board = await Board.create(2, interaction.guild.id, name, desc, sizePresets[size], sizePresets[size], (expiration == "0" || expiration == null ? null : Date.now() + parse(expiration)), quadCount);
			/**
			 * TODO: move this check somewhere above, so it checks the name before sending the quad embed
			 */
			if (board === null) return interaction.editReply({ content: 'A board with this name already exists in your guild, please choose a different name.' });
			// Update the interaction and stop collector
			await i.update({ 
				embeds: [
					new EmbedBuilder()
						.setColor(container.color.PASTEL_GREEN)
						.setTitle("Congrats! You successfully created a new VOID.")
						.addFields(
							{ name: "Name", value: board.name },
							{ name: "Description", value: board.description },
							{ name: "Size", value: board.sizeX },
							{ name: "Expires", value: board.expireAt },
							{ name: "Quadrants", value: board.quads }
						)
						.setFooter({ text: interaction.user.tag, iconUrl: interaction.user.avatarURL() })
						.setTimestamp()
				], components: [] 
			});
			btnCollector.stop();
		});
	}

	calcQuads(number) {
		// I couldnt think of a better way to determine quad sizes
		if (number % 2 == 0 && number % 4 == 0 && number % 6 == 0) {
			return [2, 4, 6]
		} else if (number % 2 == 0 && number % 4 == 0) {
			return [2, 4]
		} else {
			return [1, 2]
		}
	}
}
