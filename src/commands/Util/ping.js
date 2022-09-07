import { Command, RegisterBehavior, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { isMessageInstance } from "@sapphire/discord.js-utilities";

export class Ping extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'Ping',
            description: 'Calculates the round trip and bot to api latency.',
            preconditions: ["ownerOnly"],
            runIn: CommandOptionsRunTypeEnum.GuildText,
            chatInputCommand: {
                /* register: true, */
                behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
                idHints: ["1017091655662309480"],
                guildIds: ["975124858298040451"]
            }
        });
    }

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => {
            builder
                .setName(this.name)
                .setDescription(this.description)
        });
    }

    // Run the slash command
    async chatInputRun(interaction) {
        // Send initial message
        const msg = await interaction.reply({ content: "Doing funny stuff...", fetchReply: true }).catch(() => { });
        // Check if the interaction is a message and not apimessage
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