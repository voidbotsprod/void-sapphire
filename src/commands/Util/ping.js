import { Command, CommandOptionsRunTypeEnum, container } from '@sapphire/framework';
import { isMessageInstance } from '@sapphire/discord.js-utilities';
import languagePassthrough from '#lib/languagePassthrough';

export class PingCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'Ping',
			description: 'Calculates the round trip and bot to api latency.',
			runIn: CommandOptionsRunTypeEnum.GuildText,
			preconditions: ['insertGuildsAndUsers']
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) => {
				builder.setName(this.name).setDescription(this.description);
			},
			{
				guildIds: ['975124858298040451'], // guilds for the command to be registered in; global if empty
				idHints: '1018626872617218058' // commandId, define after registering (id will be in log after first run)
			}
		);
	}

	async chatInputRun(interaction) {
		// Send initial message and fetch it so we can access the sent message.
		const msg = await interaction
			.reply({
				content: await languagePassthrough(interaction, 'ping:Pinging'),
				fetchReply: true
			})
			.catch(() => {});

		// Check if the interaction is a message and not an APImessage
		try {
			const clientPing = Math.round(await client.ws.ping);
			const rtPing = (await msg.createdTimestamp) - interaction.createdTimestamp;
			const dbPing = container.lastPing;

            const ping_BotToApi = await languagePassthrough(interaction, 'ping:BotToApi', { "%PING_BOT_TO_API%": clientPing })
            const ping_MessageRT = await languagePassthrough(interaction, 'ping:MessageRT', { "%PING_MESSAGE_RT%": rtPing })
            const ping_DatabaseRT = await languagePassthrough(interaction, 'ping:DatabaseRT', { "%PING_DATABASE_RT%": dbPing })

            const formatted = `🏓 Pong!\n\n${ping_BotToApi}\n${ping_MessageRT}\n${ping_DatabaseRT}`;

			return await interaction.editReply({ content: formatted }).catch((e) => {
				console.log(e);
			});
		} catch (error) {
			console.log(error);
			// If the interaction is not a message, return error message
			return await interaction
				.reply({
					content: await languagePassthrough(interaction, 'ping:Failed'),
					ephemeral: true
				})
				.catch((e) => {
					console.log(e);
				});
		}
	}
}
