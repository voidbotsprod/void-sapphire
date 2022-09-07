import "dotenv/config";
import { SapphireClient, BucketScope, LogLevel } from "@sapphire/framework";
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

client.login();

global.client = client;