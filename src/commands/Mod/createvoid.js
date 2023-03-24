import { Command } from '@sapphire/framework';
import { stripIndents } from 'common-tags';
import Board from '#lib/board';
import parse from 'parse-duration';
/* import { DB } from '#lib/functions'; */

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
							1: 'Small (20x20px)',
							2: 'Normal (48x48px)',
							3: 'Large (84x84px)',
							4: 'XL (120x120px)',
							5: 'VIP - XXL (192x192px)',
							6: 'VIP - XXXL (240x240px)'
						};

						for (const [id, name] of Object.entries(sizes)) {
							option.addChoices({ name: name, value: id });
						}

						return option;
					})
					.addStringOption((option) => option.setName('expires').setDescription('VOID expiration time, 0 for none. (1h/d/w/y)').setRequired(false))
			},
			{
				guildIds: ['975124858298040451'], // guilds for the command to be registered in; global if empty
				idHints: '1088583257941082123' // commandId, define after registering (id will be in log after first run)
			}
		);
	}

	async chatInputRun(interaction) {
		const sizePresets = {
			1: 20,
			2: 48,
			3: 84,
			4: 120,
			5: 192,
			6: 240
		};

		const name = interaction.options.getString('name');
		const desc = interaction.options.getString('description');
		const size = interaction.options.getString('size');
		const expiration = interaction.options.getString('expires');

		const board = await Board.create(2, interaction.guild.id, name, desc, sizePresets[size], sizePresets[size], (expiration === 0 ? null : Date.now() + parse(expiration)));
		if(board === null) return interaction.reply({ content: 'A board with this name already exists in your guild, please choose a different name.'});

		return interaction.reply({
			content: stripIndents`
			**Created Board info:**
			Name: \`${name}\`
			Description: \`${desc}\`
			Size: \`${size}\`
			Expires At: \`${expiration}\``,
		});
	}
}
