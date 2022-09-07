import '#lib/setup';
import { LogLevel, SapphireClient, BucketScope } from '@sapphire/framework';
import { Time } from "@sapphire/time-utilities";

const client = new SapphireClient({
    intents: ['GUILDS', "GUILD_MESSAGES", "GUILD_MEMBERS"],
    defaultCooldown: {
        delay: Time.Second * 10,
        limit: 2,
        filteredUsers: process.env.OWNERS.split(","),
        scope: BucketScope.User
    },
    logger: { level: LogLevel.Info },
    allowedMentions: { repliedUser: true },
});

client.color = {
    "PASTEL_GREEN": "#87de7f",
    "CHERRY_RED": "#8e3741"
}

client.login();

global.client = client;