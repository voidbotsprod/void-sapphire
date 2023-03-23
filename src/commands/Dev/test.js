import { Command } from '@sapphire/framework';
import { stripIndents } from 'common-tags';
import Board from '#lib/board';
import { DB } from '#lib/functions';

import parse from 'parse-duration';
import humanizeDuration from 'humanize-duration';

export class TestCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'test',
			description: 'Testing.',
			preconditions: ['ownerOnly']
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) => {
				builder
					.setName(this.name)
					.setDescription(this.description)
					.addStringOption((option) => option.setName('input').setDescription('Test input').setRequired(false));
			},
			{
				guildIds: ['975124858298040451'], // guilds for the command to be registered in; global if empty
				idHints: '1018626869777670174' // commandId, define after registering (id will be in log after first run)
			}
		);
	}

	async chatInputRun(interaction) {
		// return await this.testPixelPlacement(interaction);
		return await this.testTimeInput(interaction);
	}

	async testTimeInput(interaction) {
		var time = interaction.options.getString('input');

		if (!time) {
			return reply(message, 'You must specify a time.');
		}

		var duration = parse(time, 'ms');

		// if (!duration) {
		// 	return reply(message, 'You must specify a valid time.');
		// }

		// if (duration < 0) {
		// 	return reply(message, 'You must specify a time greater than 1 second.');
		// }

		return interaction.reply({
			content: `${time} = ${duration}ms\n\nWhich is ${humanizeDuration(duration, { units: ['y', 'mo', 'w', 'd', 'h', 'm', 's', 'ms'], conjunction: ' and ', serialComma: false })}`
		});
	}

	async testPixelPlacement(interaction) {
		const board = await Board.getByName(interaction.guild.id, 'Test 4');

		// await board.fillRandom(board.sizeX, board.sizeY);
		return interaction.reply({
			content: stripIndents`
**Board info:**
ID: \`${board.id}\`
Type: \`${board.type === 1 ? 'Global' : 'Guild'}\`
Guild: \`${board.guildId}\`
Name: \`${board.name}\`
Description: \`${board.description}\`
Size: \`${board.sizeX}x${board.sizeY}\`
Created At: \`${board.createdAt}\`
Expires At: \`${board.expireAt ? board.ExpireAt : 'Never'}\``,
			files: [
				{
					attachment: await board.getImage(),
					name: 'board.png'
				}
			]
		});
	}
}
