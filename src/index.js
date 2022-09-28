import '#lib/setup';
import { BucketScope, LogLevel, SapphireClient } from '@sapphire/framework';
import '@sapphire/plugin-i18next/register';
import { Time } from "@sapphire/time-utilities";
import mysql from "mysql2";
import { DB } from '#lib/functions'

const client = new SapphireClient({
    intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS'],
    i18n: {
        fetchLanguage: async (context) => {
            const defaultLanguage = 'en-US';
            if (!context.guild) return defaultLanguage;
            // Accepted language codes: http://www.lingoes.net/en/translator/langcode.htm
            const languageQuery = await DB(`SELECT Code FROM languages JOIN guilds ON languages.id = guilds.languageId WHERE guilds.id = ?`, [context.guild.id]);
            // Check if theres a language set for the guild
            return !languageQuery ? defaultLanguage : languageQuery.Code;

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

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

global.dbPool = pool.promise();
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