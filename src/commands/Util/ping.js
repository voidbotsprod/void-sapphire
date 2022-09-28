import { resolveKey } from '@sapphire/plugin-i18next';
import { Command, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { DB } from '#lib/functions'

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
        await DB(`INSERT INTO ping (UserId, GuildId, PingedAt) VALUES (?, ?, ?)`, [interaction.user.id, interaction.guildId, Date.now()]);

        // Check if the interaction is a message and not an APImessage
        if (isMessageInstance(msg)) {
            const clientPing = Math.round(await client.ws.ping);
            const rtPing = msg.createdTimestamp - interaction.createdTimestamp
            const pingedAtTime = await DB(`SELECT PingedAt FROM ping WHERE UserId = ? AND GuildId = ?`, [interaction.user.id, interaction.guildId])
            const dbPing = Date.now() - pingedAtTime.PingedAt;

            const ping_BotToApi = await resolveKey(msg, 'ping:BotToApi')
            const ping_MessageRT = await resolveKey(msg, 'ping:MessageRT')
            const ping_DatabaseRT = await resolveKey(msg, 'ping:DatabaseRT')

            const formatted = `🏓 Pong!\n\n**${ping_BotToApi}:** ${clientPing}ms\n**${ping_MessageRT}:** ${rtPing}ms\n**${ping_DatabaseRT}:** ${dbPing}ms`;

            await DB(`DELETE FROM ping WHERE UserId = ? AND GuildId = ?`, [interaction.user.id, interaction.guildId]);
            return await interaction.editReply({ content: formatted }).catch(() => { });
        }
        // If the interaction is not a message, return error message
        await DB(`DELETE FROM ping WHERE UserId = ? AND GuildId = ?`, [interaction.user.id, interaction.guildId]);
        return await interaction.reply({ content: await resolveKey(interaction, 'ping:Failed'), ephemeral: true }).catch(() => { });
    }
}