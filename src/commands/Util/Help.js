const { MessageEmbed } = require("discord.js");
const { Command, CommandOptionsRunTypeEnum, RegisterBehavior } = require('@sapphire/framework');
const { PASTEL_GREEN } = require("../../lib/shared/colors.json")
const { capitalize } = require("../../lib/shared/functions.js")

class Help extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'Help',
            description: 'Shows additional information about commands.',
            runIn: CommandOptionsRunTypeEnum.GuildText,
            chatInputCommand: {
                behaviourWhenNotIdentical: RegisterBehavior.Overwrite,
                idHints: ["1017041338400788530"],
                guildIds: ["975124858298040451"],
            }
        });
    }

    // Checking if the user wants to search for a command, if not, list all commands
    async chatInputRun(interaction) {
        const str = await interaction.options.getString("search", true);

        return await this.search(interaction, str);
    }

    async search(interaction, args) {
        // Trying to find the command from args
        const command = this.container.stores.get("commands").get(args);

        const successEmbed = new MessageEmbed()
            .setTitle(`Search Result | ${command.name}`)
            .setDescription(`**Name:** ${command.name}\n**Description:** \`${command.description}\``)
            .setColor(PASTEL_GREEN)

        return await interaction.reply({ embeds: [successEmbed], ephemeral: true })
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

                    // Get all command names and put them in an array
                    this.container.stores.get("commands").forEach(c => {
                        option.addChoices({ name: capitalize(c.name), value: c.name });
                    });
                    return option;
                })
        })
    }

}

module.exports = { Help };