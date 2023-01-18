import { CommandOptionsRunTypeEnum, container } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { DB } from '#lib/functions';
import { EmbedBuilder } from '@discordjs/builders';
import languagePassthrough from '#lib/languagePassthrough';

export class LanguageCommand extends Subcommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'language',
			description: 'Change the bot language for your server.',
			preconditions: ['modOnly'],
			subcommands: [
				{
					name: 'set',
					chatInputRun: 'setLanguage'
				},
				{
					name: 'reset',
					chatInputRun: 'resetLanguage'
				},
				{
					name: 'view',
					chatInputRun: 'viewLanguage'
				}
			],
			runIn: CommandOptionsRunTypeEnum.GuildText
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) => {
				builder
					.setName(this.name)
					.setDescription(this.description)
					.addSubcommand((command) =>
						command
							.setName('set')
							.setDescription('Set a new guild language.')
							.addStringOption((option) => {
								option
									.setName('language')
									.setDescription('Available languages')
									.setRequired(true)
									.addChoices({ name: 'English', value: '1' }, { name: 'German', value: '2' }, { name: 'Croatian', value: '3' });
								return option;
							})
					)
					.addSubcommand((command) => command.setName('reset').setDescription('Reset the current guild language.'))
					.addSubcommand((command) => command.setName('view').setDescription('View the current guild language.'));
			},
			{
				guildIds: ['975124858298040451'], // guilds for the command to be registered in; global if empty
				idHints: '1020425491926237314' // commandId, define after registering (id will be in log after first run)
			}
		);
	}

	async setLanguage(interaction) {
		const inputLang = interaction.options.getString('language');

		const currentGuild = await DB(`SELECT * FROM guilds WHERE Id = '${interaction.guild.id}'`);

		// if the guild doesnt exist, add it
		if (!currentGuild.Id) {
			await DB(`INSERT INTO guilds (Id, LanguageId) VALUES ('${interaction.guild.id}', ${inputLang})`);
			global.guildLanguages.push({ guildId: interaction.guild.id, languageId: inputLang });
		}

		// if the language is already set to the input, resolve and return
		if (currentGuild.LanguageId == inputLang) {
			return interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setColor(container.color.PASTEL_GREEN)
						.setDescription(await languagePassthrough(interaction, 'language:NotChanged', { '%LANGUAGE%': await languagePassthrough(interaction, 'language:languageNameLocalized') }))
						.setFooter({ text: interaction.user.tag, iconUrl: interaction.user.avatarURL() })
						.setTimestamp()
				]
			});
		}

		// if the guild exists, update the language to the input
		await DB(`UPDATE guilds SET LanguageId = ${inputLang} WHERE Id = '${interaction.guild.id}'`);
		global.guildLanguages.find((c) => c.guildId === interaction.guild.id).languageId = inputLang;

		return await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(container.color.PASTEL_GREEN)
					.setDescription(await languagePassthrough(interaction, 'language:LanguageSet', { '%LANGUAGE%': await languagePassthrough(interaction, 'language:languageNameLocalized') }))
					.setFooter({ text: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
					.setTimestamp()
			]
		});
	}

	async resetLanguage(interaction) {
		const currentGuild = await DB(`SELECT * FROM guilds WHERE Id = '${interaction.guild.id}'`);

		// if the guild doesnt exist, add it
		if (!currentGuild.Id) {
			await DB(`INSERT INTO guilds (Id, LanguageId) VALUES ('${interaction.guild.id}', 1)`);
			global.guildLanguages.push({ guildId: interaction.guild.id, languageId: 1 });
		}

		// if the language is already set to the input, resolve and return
		if (currentGuild.LanguageId == 1) {
			return interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setColor(container.color.PASTEL_GREEN)
						.setDescription(await languagePassthrough(interaction, 'language:NotChanged', { '%LANGUAGE%': await languagePassthrough(interaction, 'language:languageNameLocalized') }))
						.setFooter({ text: interaction.user.tag, iconUrl: interaction.user.avatarURL() })
						.setTimestamp()
				]
			});
		}

		// if the guild exists, update the language to the input
		await DB(`UPDATE guilds SET LanguageId = 1 WHERE Id = '${interaction.guild.id}'`);
		global.guildLanguages.find((c) => c.guildId === interaction.guild.id).languageId = 1;

		return await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(container.color.PASTEL_GREEN)
					.setDescription(await languagePassthrough(interaction, 'language:LanguageReset', { '%LANGUAGE%': await languagePassthrough(interaction, 'language:languageNameLocalized') }))
					.setFooter({ text: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
					.setTimestamp()
			]
		});
	}

	async viewLanguage(interaction) {
		const currentGuild = await DB(`SELECT * FROM guilds WHERE Id = '${interaction.guild.id}'`);

		// if the guild doesnt exist, add it
		if (!currentGuild.Id) {
			await DB(`INSERT INTO guilds (Id, LanguageId) VALUES ('${interaction.guild.id}', 1)`);
			global.guildLanguages.push({ guildId: interaction.guild.id, languageId: 1 });
		}

		return await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(container.color.PASTEL_GREEN)
					.setDescription(await languagePassthrough(interaction, 'language:CurrentLanguage', { '%LANGUAGE%': await languagePassthrough(interaction, 'language:languageNameLocalized') }))
					.setFooter({ text: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
					.setTimestamp()
			]
		});
	}
}
