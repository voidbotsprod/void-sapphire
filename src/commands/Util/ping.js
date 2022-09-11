import { resolveKey } from '@sapphire/plugin-i18next';
import { Command, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { isMessageInstance } from "@sapphire/discord.js-utilities";

export class PingCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'Ping',
            description: 'Calculates the round trip and bot to api latency.',
            runIn: CommandOptionsRunTypeEnum.GuildText
        });
    }

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => {
            builder
                .setName(this.name)
                .setDescription(this.description)
        }, {
            guildIds: ['975124858298040451'], // guilds for the command to be registered in; global if empty
            idHints: '1017764481285247077', // commandId, define after registering (id will be in log after first run)
        })
    }

    async chatInputRun(interaction) {
        // Send initial message and fetch it so we can access the sent message.
        const msg = await interaction.reply({
            content: await resolveKey(interaction, 'ping:pinging'),
            fetchReply: true
        }).catch(() => { });

        // Check if the interaction is a message and not an APImessage
        if (isMessageInstance(msg)) {
            const clientPing = Math.round(await client.ws.ping);
            const rtPing = msg.createdTimestamp - interaction.createdTimestamp
            const formatted = `🏓 Pong!\n\n**${await resolveKey(msg, 'ping:botToApi')}:** ${clientPing}ms\n**${await resolveKey(msg, 'ping:messageRT')}:** ${rtPing}ms`

            return await interaction.editReply({ content: formatted }).catch(() => { });
        }

        // If the interaction is not a message, return error message
        return await interaction.reply({ content: await resolveKey(interaction, 'ping:failed'), ephemeral: true }).catch(() => { });
    }
}