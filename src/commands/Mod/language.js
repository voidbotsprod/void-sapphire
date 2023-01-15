import { CommandOptionsRunTypeEnum, container } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { DB } from '#lib/functions'
import { EmbedBuilder } from '@discordjs/builders';
import languagePassthrough from '#lib/languagePassthrough';

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
                    (command) =>
                        command.setName('set')
                            .setDescription('Set a new guild language.')
                            .addStringOption(option => {
                                option
                                    .setName("language")
                                    .setDescription("Available languages")
                                    .setRequired(true)
                                    .addChoices(
                                        { name: 'English', value: "1" },
                                        { name: 'German', value: "2" },
                                        { name: 'Croatian', value: "3" });

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
        console.log("got here 1")
        // Get data from db
        await DB(`SELECT * FROM guilds WHERE Id = '${interaction.guild.id}'`).then(async (result) => {
            console.log("got here 2")

            const inputLang = interaction.options.getString('language');
            // If the guild doesnt exist for some reason, add it
            if (!result.Id) await DB(`INSERT INTO guilds (Id, LanguageId) VALUES ('${interaction.guild.id}', ${await this.findLangId(inputLang)})`);
            // If the guild exists, update the language
            console.log("got here 2")

            if (reset) {
                console.log("got here 3")

                await DB(`UPDATE guilds SET LanguageId = 1 WHERE Id = '${interaction.guild.id}'`);
                embed.setDescription(await languagePassthrough(interaction, `language:LanguageReset`))
                console.log("got here 4")

                return await interaction.reply({ embeds: [embed] });
            } else {
                console.log("got here 5")

                embed.setDescription(`${await languagePassthrough(interaction, "language:NotChanged")} \`${await languagePassthrough(interaction, "language:languageNameLocalized")}\`.`)
                if (result.LanguageId === await this.findLangId(inputLang)) return await interaction.reply({ embeds: [embed] });
                console.log("got here 6")

                await DB(`UPDATE guilds SET LanguageId = ${await this.findLangId(inputLang)} WHERE Id = '${interaction.guild.id}'`);
                embed.setDescription(`${await languagePassthrough(interaction, "language:LanguageSet")} \`${await languagePassthrough(interaction, "language:languageNameLocalized")}\`!`)
                console.log("got here 7")

                return await interaction.reply({ embeds: [embed] });
            }
        });
    }

    async viewLanguage(interaction, embed) {
        // Get data from db
        await DB(`SELECT LanguageId FROM guilds WHERE Id = '${interaction.guild.id}'`).then(async (result) => {
            // If the guild doesnt exist for some reason, add it
            if (!result.LanguageId) await DB(`INSERT INTO guilds (Id, LanguageId) VALUES ('${interaction.guild.id}', 1)`);
            embed.setDescription(`${await languagePassthrough(interaction, "language:CurrentLanguage")} \`${await languagePassthrough(interaction, "language:languageNameLocalized")}\`.`)

            return await interaction.reply({ embeds: [embed], ephemeral: true });
        });
    }

    /* findLangName(code) {
        if (typeof code === "string") return container.languageList.find(c => c.Code === code).Name;
        else if (typeof code === 'number') return container.languageList.find(c => c.Id === code).Name;
        else return "Error"
    } */

    async findLangId(code) {
        const langArray = Object.keys(await languageList).map(key => languageList[key]);
        console.log(langArray)
        if (langArray.length && typeof code === "string") return langArray.find(c => c.Code === code);
        else return "Error"
    }
}