import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { DB } from '#lib/functions'

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
                .addSubcommand((command) => command.setName('set').setDescription('Set a new guild language.'))
                .addSubcommand((command) => command.setName('reset').setDescription('Reset the current guild language.'))
                .addSubcommand((command) => command.setName('view').setDescription('View the current guild language.'))
        }, {
            guildIds: ['975124858298040451'], // guilds for the command to be registered in; global if empty
            idHints: '1020425491926237314', // commandId, define after registering (id will be in log after first run)
        })
    }

    async chatInputRun(interaction) {
        const subcommandType = interaction.options._subcommand;

        if (subcommandType === "set") {
            this.setLanguage(interaction, 1);
        } else if (subcommandType === "reset") {
            return await interaction.reply({ content: "Reset (WIP)" })

        } else if (subcommandType === "view") {
            return await interaction.reply({ content: "View (WIP)" })

        }
    }

    async setLanguage(interaction, language) {
        await DB(`SELECT * FROM guilds WHERE Id = '${interaction.guildId}'`).then(async (result) => {
            if (!result.Id) {
                await DB(`INSERT INTO guilds (Id, LanguageId) VALUES ('${interaction.guildId}', ${language})`);
                return await interaction.reply({ content: "Language set to English (US)." })
            } else {
                if(result.LanguageId === language) return await interaction.reply({ content: "Language is already set to English (US)." });

                await DB(`UPDATE guilds SET LanguageId = ${language} WHERE Id = '${interaction.guildId}'`);
                return await interaction.reply({ content: `Language set to ${language}` })
            }
        });
    }
}