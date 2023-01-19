import '#lib/setup';
import { BucketScope, LogLevel, SapphireClient, container } from '@sapphire/framework';
import { GatewayIntentBits } from 'discord.js';
import { Time } from '@sapphire/time-utilities';
import { blue, gray, green, magenta, magentaBright, white, yellow, redBright, red } from 'colorette';

const client = new SapphireClient({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers],
	defaultCooldown: {
		delay: Time.Second * 10,
		limit: 2,
		filteredUsers: process.env.OWNERS.split(','),
		scope: BucketScope.User
	},
	shards: 'auto',
	logger: { level: LogLevel.Info },
	allowedMentions: { repliedUser: true },
	partials: ['CHANNEL']
});

global.client = client;

try {
	client.logger.info('Logging in...');
	await client.login();
	client.logger.info(`Logged in as ${green(client.user.username)} [${gray(client.user.id)}]`);
} catch (error) {
	client.logger.fatal(error);
	client.destroy();
	process.exit(1);
}
