import { Command, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { isMessageInstance } from "@sapphire/discord.js-utilities";
export class Ping extends Command {
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
            idHints: '1017336633181351937', // commandId, define after registering (id will be in log after first run)
        })
    }

    async chatInputRun(interaction) {
        // Send initial message and fetch it so we can access the sent message.
        const msg = await interaction.reply({
            content: "Doing funny stuff...",
            fetchReply: true
        }).catch(() => { });

        // Check if the interaction is a message and not an APImessage
        if (isMessageInstance(msg)) {
            const clientPing = Math.round(await client.ws.ping);
            const rtPing = await msg.createdTimestamp - await interaction.createdTimestamp
            const formatted = `🏓 Pong!\n\n**Bot to API:** ${clientPing}ms\n**Message Round Trip:** ${rtPing}ms`

            return await interaction.editReply({ content: formatted }).catch(() => { });
        }

        // If the interaction is not a message, return error message
        return await interaction.reply({ content: "Failed to retrieve ping!" });
    }
}