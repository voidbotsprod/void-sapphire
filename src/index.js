import '#lib/setup';
import { LogLevel, SapphireClient, BucketScope } from '@sapphire/framework';
import { Time } from "@sapphire/time-utilities";
import '@sapphire/plugin-i18next/register';

const client = new SapphireClient({
    intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS'],
    i18n: {
        fetchLanguage: async (context) => {
            const defaultLanguage = 'en-US';
            if (!context.guild) return defaultLanguage;
            // Accepted language codes: http://www.lingoes.net/en/translator/langcode.htm
            const languageQuery = await DB.execute(`SELECT Code FROM languages JOIN guilds ON languages.id = guilds.languageId WHERE guilds.id = ?`, [context.guild.id]);
            // Check if theres a language set for the guild
            return !languageQuery[0][0] ? defaultLanguage : languageQuery[0][0].Code;

        }
    },
    defaultCooldown: {
        delay: Time.Second * 10,
        limit: 2,
        filteredUsers: process.env.OWNERS.split(','),
        scope: BucketScope.User
    },
    shards: 'auto',
    logger: { level: LogLevel.Info },
    allowedMentions: { repliedUser: true },
    partials: ['CHANNEL'],
});

global.client = client;

const main = async () => {
    try {
        client.logger.info('Logging in...');
        await client.login();
        client.logger.info(`Logged in as ${client.user.username} [${client.user.id}]`);
    } catch (error) {
        client.logger.fatal(error);
        client.destroy();
        process.exit(1);
    }
};

main();