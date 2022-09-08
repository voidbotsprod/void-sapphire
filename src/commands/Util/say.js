import { Command, CommandOptionsRunTypeEnum } from '@sapphire/framework';

export class Say extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'say',
            aliases: ['echo', 's'],
            description: 'Sends text.',
            preconditions: ["ownerOnly"],
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
            idHints: '1017143182309474334', // commandId, define after registering (id will be in log after first run)
        })
    }

    // Run the slash command
    async chatInputRun(interaction) {
        let text = interaction.options.getString("text", true);

        return await interaction.reply({ content: text })
    }
}