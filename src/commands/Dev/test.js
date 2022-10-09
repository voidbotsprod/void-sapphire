import { Command } from '@sapphire/framework';
import { stripIndents } from 'common-tags'

import Board from '#lib/board';

export class TestCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'test',
            description: 'Testing.',
            preconditions: ["ownerOnly"]
        });
    }

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => {
            builder
                .setName(this.name)
                .setDescription(this.description)
        }, {
            guildIds: ['975124858298040451'], // guilds for the command to be registered in; global if empty
            idHints: '1018626869777670174', // commandId, define after registering (id will be in log after first run)
        })
    }

    async chatInputRun(interaction) {

        const TestBoard = new Board()
        const test = await TestBoard.create(interaction, 'global', interaction.guild.id, 100, 100, null)

        console.log(await test)
        await interaction.reply({
            content: stripIndents`
            ${await test.existed ? '**Board info:**\n' : '**Created new board:**\n'}
            ID: ${await test.Id}
            Type: ${await test.BoardTypeId}
            Guild: ${await test.GuildId}
            Size: ${await test.SizeX}x${await test.SizeY}
            Created At: ${await test.CreatedAt}
            Expires At: ${await test.ExpireAt ? test.ExpireAt : 'Never'}`
        })

    }
}