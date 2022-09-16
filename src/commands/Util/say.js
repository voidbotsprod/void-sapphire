import { Command, CommandOptionsRunTypeEnum } from '@sapphire/framework';

export class SayCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'say',
            description: 'Sends text.',
            runIn: CommandOptionsRunTypeEnum.GuildText
        });
    }

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => {
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addStringOption((option) =>
                    option
                        .setName("text")
                        .setDescription("The text to send.")
                        .setRequired(true)
                )
        }, {
            guildIds: ['975124858298040451'], // guilds for the command to be registered in; global if empty
            idHints: '1018626955790258308', // commandId, define after registering (id will be in log after first run)
        })
    }

    async chatInputRun(interaction) {
        let text = interaction.options.getString("text", true);

        return await interaction.reply({ content: text })
    }
}