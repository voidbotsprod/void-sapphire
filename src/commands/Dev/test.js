import { Command } from '@sapphire/framework';
import { stripIndents } from 'common-tags';
import Board from '#lib/board';
import { DB } from '#lib/functions';

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
				builder.setName(this.name).setDescription(this.description);
			},
			{
				guildIds: ['975124858298040451'], // guilds for the command to be registered in; global if empty
				idHints: '1018626869777670174' // commandId, define after registering (id will be in log after first run)
			}
		);
	}

	async chatInputRun(interaction) {
		// const TestBoard = new Board()
		// const test = await TestBoard.create(interaction, 'guild', interaction.guild.id, "Test 4.5", "Cool description 4", 540, 630, null)

		// await interaction.reply({
		//     content: stripIndents`
		//     ${test.existed ? '**Board info:**\n' : '**Created new board:**\n'}
		//     ID: \`${test.Id}\`
		//     Type: \`${test.BoardTypeId === 1 ? 'Global' : 'Guild'}\`
		//     Guild: \`${test.GuildId}\`
		//     Name: \`${test.Name}\`
		//     Description: \`${test.Description}\`
		//     Size: \`${test.SizeX}x${test.SizeY}\`
		//     Created At: \`${test.CreatedAt}\`
		//     Expires At: \`${test.ExpireAt ? test.ExpireAt : 'Never'}\`
		//     `
		// })

		let res = await dbPool.execute('SELECT * FROM languages;');

		console.log(res[0]);
		console.log(res[0][0]); // 1st row
		console.log(res[0][1]); // 2nd row
		console.log(res[0][2]); // 3rd row

		res[0].forEach((row) => {
			console.log(row);
		});

		let strRes = '';

		for (let key of Object.keys(res[0])) {
			for (let key2 of Object.keys(res[0][key])) {
				strRes += `${key2}: ${res[0][key][key2]}\n`;
			}
			strRes += `\n`;
		}

		interaction.reply({
			content: strRes
		});
	}
}
