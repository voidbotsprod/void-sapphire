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
            idHints: '1018626872617218058', // commandId, define after registering (id will be in log after first run)
        })
    }

    async chatInputRun(interaction) {
        // Send initial message and fetch it so we can access the sent message.
        const msg = await interaction.reply({
            content: await resolveKey(interaction, 'ping:Pinging'),
            fetchReply: true
        }).catch(() => { });
        // Insert initial timestamp
        await DB.execute(`INSERT INTO ping (UserId, GuildId, PingedAt) VALUES (?, ?, ?)`, [interaction.user.id, interaction.guildId, Date.now()]);

        // Check if the interaction is a message and not an APImessage
        if (isMessageInstance(msg)) {
            const clientPing = Math.round(await client.ws.ping);
            const rtPing = msg.createdTimestamp - interaction.createdTimestamp
            const dbPing = Date.now() - (await DB.execute(`SELECT PingedAt FROM ping WHERE UserId = ? AND GuildId = ?`, [interaction.user.id, interaction.guildId]))[0][0].PingedAt;
            const formatted = `🏓 Pong!\n\n**${await resolveKey(msg, 'ping:BotToApi')}:** ${clientPing}ms\n**${await resolveKey(msg, 'ping:MessageRT')}:** ${rtPing}ms\n**${await resolveKey(msg, 'ping:DatabaseRT')}:** ${dbPing}ms`;

            // Remove inserted timestamp
            await DB.execute(`DELETE FROM ping WHERE UserId = ? AND GuildId = ?`, [interaction.user.id, interaction.guildId]);

            return await interaction.editReply({ content: formatted }).catch(() => { });
        }
        // If the interaction is not a message, return error message
        return await interaction.reply({ content: await resolveKey(interaction, 'ping:Failed'), ephemeral: true }).catch(() => { });
    }
}