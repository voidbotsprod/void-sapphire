import { resolveKey } from '@sapphire/plugin-i18next';
import { Command, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { capitalize } from '#lib/functions';
import { EmbedBuilder } from 'discord.js';

export class HelpCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'Help',
            description: 'Shows additional information about commands.',
            runIn: CommandOptionsRunTypeEnum.GuildText
        });
    }

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => {
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addStringOption(option => {
                    option
                        .setName("search")
                        .setDescription("Get information about a command.")
                        .setRequired(true)

                    this.container.stores.get("commands").forEach(c => {
                        option.addChoices({ name: capitalize(c.name), value: c.name });
                    });
                    return option;
                })
        }, {
            guildIds: ['975124858298040451'], // guilds for the command to be registered in; global if empty
            idHints: '1018626871690268742', // commandId, define after registering (id will be in log after first run)
        })
    }

    // Checking if the user wants to search for a command, if not, list all commands
    async chatInputRun(interaction) {
        const str = await interaction.options.getString("search", true);

        return await this.search(interaction, str);
    }

    async search(interaction, args) {
        // Trying to find the command from args
        const command = this.container.stores.get("commands").get(args);

        const successEmbed = new EmbedBuilder()
            .setTitle(`${await resolveKey(interaction, 'help:SearchResult')} | ${command.name}`)
            .setDescription(`**${await resolveKey(interaction, 'help:CommandSuccessName')}:** ${command.name}\n**${await resolveKey(interaction, 'help:CommandSuccessDescription')}:** \`${command.description}\``)
            .setColor(this.container.color.PASTEL_GREEN)

        return await interaction.reply({ embeds: [successEmbed], ephemeral: true })
    }
}