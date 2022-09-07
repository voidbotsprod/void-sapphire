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
    shards: 'auto',
    logger: { level: LogLevel.Info },
    allowedMentions: { repliedUser: true },
    partials: ['CHANNEL'],
});

global.client = client;

container.color = {
    PASTEL_GREEN: 0x87de7f,
    CHERRY_RED: 0x8e3741,
    BLURPLE: 0x5865F2,
	BLURPLE_CLASSIC: 0x7289DA,
	GREYPLE: 0x99AAB5,
	DARK_BUT_NOT_BLACK: 0x2C2F33,
	NOT_QUITE_BLACK: 0x23272A
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