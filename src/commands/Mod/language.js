import { CommandOptionsRunTypeEnum, container } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { DB } from '#lib/functions'
import { EmbedBuilder } from '@discordjs/builders';
import { resolveKey } from '@sapphire/plugin-i18next';

export class LanguageCommand extends Subcommand {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'language',
            description: 'Change the bot language for your server.',
            preconditions: ["modOnly"],
            subcommands: [
                {
                    name: 'set',
                    chatInputRun: 'chatInputRunGlobal'
                },
                {
                    name: 'reset',
                    chatInputRun: 'chatInputRunGuild'
                },
                {
                    name: 'view',
                    chatInputRun: 'chatInputRunAll'
                }
            ],
            runIn: CommandOptionsRunTypeEnum.GuildText
        });
    }

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => {
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addSubcommand(
                    (command) => command.setName('set')
                        .setDescription('Set a new guild language.')
                        .addStringOption((option) => {
                            option
                                .setName("language")
                                .setDescription("Available languages")
                                .setRequired(true)

                            container.languageList.forEach(c => {
                                option.addChoices({ name: c.Name, value: c.Code });
                            });

                            return option;
                        })
                )
                .addSubcommand((command) => command.setName('reset').setDescription('Reset the current guild language.'))
                .addSubcommand((command) => command.setName('view').setDescription('View the current guild language.'))
        }, {
            guildIds: ['975124858298040451'], // guilds for the command to be registered in; global if empty
            idHints: '1020425491926237314', // commandId, define after registering (id will be in log after first run)
        })
    }

    async chatInputRun(interaction) {
        const subcommandType = interaction.options._subcommand;
        const baseEmbed = new EmbedBuilder()
            .setColor(container.color.PASTEL_GREEN)
            .setFooter({ text: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
            .setTimestamp();

        if (subcommandType === "set") this.setLanguage(interaction, false, baseEmbed);
        else if (subcommandType === "reset") this.setLanguage(interaction, true, baseEmbed);
        else if (subcommandType === "view") this.viewLanguage(interaction, baseEmbed);
    }

    async setLanguage(interaction, reset = false, embed) {
        // Get data from db
        await DB(`SELECT * FROM guilds WHERE Id = '${interaction.guildId}'`).then(async (result) => {
            const inputLang = interaction.options.getString('language');
            // If the guild doesnt exist for some reason, add it
            if (!result.Id) await DB(`INSERT INTO guilds (Id, LanguageId) VALUES ('${interaction.guildId}', ${this.findLangId(inputLang)})`);
            // If the guild exists, update the language
            if (reset) {
                await DB(`UPDATE guilds SET LanguageId = 1 WHERE Id = '${interaction.guildId}'`);
                embed.setDescription(await resolveKey(interaction, `language:LanguageReset`))

                return await interaction.reply({ embeds: [embed] });
            } else {
                embed.setDescription(`${await resolveKey(interaction, "language:NotChanged")} \`${await resolveKey(interaction, "language:languageNameLocalized")}\`.`)
                if (result.LanguageId === this.findLangId(inputLang)) return await interaction.reply({ embeds: [embed] });

                await DB(`UPDATE guilds SET LanguageId = ${this.findLangId(inputLang)} WHERE Id = '${interaction.guildId}'`);
                embed.setDescription(`${await resolveKey(interaction, "language:LanguageSet")} \`${await resolveKey(interaction, "language:languageNameLocalized")}\`!`)

                return await interaction.reply({ embeds: [embed] });
            }
        });
    }

    async viewLanguage(interaction, embed) {
        // Get data from db
        await DB(`SELECT LanguageId FROM guilds WHERE Id = '${interaction.guildId}'`).then(async (result) => {
            // If the guild doesnt exist for some reason, add it
            if (!result.LanguageId) await DB(`INSERT INTO guilds (Id, LanguageId) VALUES ('${interaction.guildId}', 1)`);
            embed.setDescription(`${await resolveKey(interaction, "language:CurrentLanguage")} \`${await resolveKey(interaction, "language:languageNameLocalized")}\`.`)

            return await interaction.reply({ embeds: [embed], ephemeral: true });
        });
    }

    /* findLangName(code) {
        if (typeof code === "string") return container.languageList.find(c => c.Code === code).Name;
        else if (typeof code === 'number') return container.languageList.find(c => c.Id === code).Name;
        else return "Error"
    } */

    findLangId(code) {
        if (typeof code === "string") return container.languageList.find(c => c.Code === code).Id;
        else return "Error"
    }
}