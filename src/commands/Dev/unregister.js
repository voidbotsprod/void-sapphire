import { Subcommand } from '@sapphire/plugin-subcommands';

import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

export class UnregisterCommand extends Subcommand {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'unregister',
            aliases: [],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
            preconditions: ['ownerOnly'],
            generateDashLessAliases: true,
            flags: [],
            options: [],
            nsfw: false,
            description: 'Unregisters all slash commands.',
            usage: '[all|global|guild]',
            examples: [''],
            subcommands: [
                {
                    name: 'global',
                    chatInputRun: 'chatInputRunGlobal'
                },
                {
                    name: 'guild',
                    chatInputRun: 'chatInputRunGuild'
                },
                {
                    name: 'all',
                    chatInputRun: 'chatInputRunAll'
                }
            ]
        });
    }

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => {
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addSubcommand((command) => command.setName('all').setDescription('Unregister all application commands.'))
                .addSubcommand((command) => command.setName('global').setDescription('Unregister all global application commands.'))
                .addSubcommand((command) => command.setName('guild').setDescription('Unregister all guild application commands.'))
        }, {
            guildIds: ['975124858298040451'], // guilds for the command to be registered in; global if empty
            idHints: '1017764478995152896', // commandId, define after registering (id will be in log after first run)
        })
    }

    async chatInputRunAll(interaction) {
        rest.put(Routes.applicationGuildCommands(this.container.client.id, interaction.guild.id), { body: [] })
            .catch(console.error);

        rest.put(Routes.applicationCommands(this.container.client.id), { body: [] })
            .catch(console.error);

        return interaction.reply({
            content: 'Successfully unregistered **all** application commands.\nYou will need to update the idHints after the next start.',
            embeds: [],
            ephemeral: true
        });
    }

    async chatInputRunGlobal(interaction) {
        rest.put(Routes.applicationCommands(client.id), { body: [] })
            .catch(console.error);

        return interaction.reply({
            content: 'Successfully unregistered all **global** application commands.\nYou will need to update the idHints after the next start.',
            embeds: [],
            ephemeral: true
        });
    }

    async chatInputRunGuild(interaction) {
        rest.put(Routes.applicationGuildCommands(client.id, interaction.guild.id), { body: [] })
            .catch(console.error);


        return interaction.reply({
            content: 'Successfully unregistered all **guild** application commands.\nYou will need to update the idHints after the next start.',
            embeds: [],
            ephemeral: true
        });
    }
}