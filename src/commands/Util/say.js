import { Command, RegisterBehavior, CommandOptionsRunTypeEnum } from '@sapphire/framework';

export class Say extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'say',
            aliases: ['echo', 's'],
            description: 'say funny stuff',
            preconditions: ["ownerOnly"],
            runIn: CommandOptionsRunTypeEnum.GuildText,
            chatInputCommand: {
                /* register: true, */
                behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
                idHints: ["1017091656807362581"],
                guildIds: ["975124858298040451"],
            },
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
                        .setDescription("The text to say")
                        .setRequired(true)
                )
        });
    }

    // Run the slash command
    async chatInputRun(interaction) {
        let text = interaction.options.getString("text", true);

        return await interaction.reply({ content: text })
    }
}