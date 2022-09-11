import { Command } from '@sapphire/framework';
import { codeBlock, isThenable } from '@sapphire/utilities';
import { inspect } from 'node:util';


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
        interaction.reply({
            content: 'test'
        })
    }
}