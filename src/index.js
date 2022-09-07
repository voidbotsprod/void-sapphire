import '#lib/setup';
import { container, LogLevel, SapphireClient, BucketScope } from '@sapphire/framework';
import { Time } from "@sapphire/time-utilities";

const client = new SapphireClient({
    intents: [
        'GUILDS',
        'GUILD_MESSAGES',
        'GUILD_MEMBERS'],
    defaultCooldown: {
        delay: Time.Second * 10,
        limit: 2,
        filteredUsers: process.env.OWNERS.split(',',),
        scope: BucketScope.User
    },
    logger: { level: LogLevel.Info },
    allowedMentions: { repliedUser: true },
});

global.client = client;

container.color = {
    "PASTEL_GREEN": "#87de7f",
    "CHERRY_RED": "#8e3741"
}

const main = async () => {
    try {
        client.logger.info('Logging in...');
        await client.login(process.env.NODE_ENV == 'PRODUCTION' ? process.env.PROD_TOKEN : process.env.DEV_TOKEN);
        client.logger.info(`Logged in as ${client.user.username} [${client.user.id}]`);
    } catch (error) {
        client.logger.fatal(error);
        client.destroy();
        process.exit(1);
    }
};

main();