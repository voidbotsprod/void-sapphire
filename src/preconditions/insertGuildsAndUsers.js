import { AllFlowsPrecondition } from '@sapphire/framework';
import { DB } from '#lib/functions'

export class insertGuildsAndUsersPrecondition extends AllFlowsPrecondition {

    async chatInputRun(interaction) {
        try {
            const userExists = await this.checkIfUserExists(interaction);
            const guildExists = await this.checkIfGuildExists(interaction);

            // if user does not exist insert user into database
            if (!userExists) await this.insertUser(interaction);
            // if guild does not exist insert guild into database
            if (!guildExists) await this.insertGuild(interaction);

            return this.ok();
        } catch (error) {
            return this.error({ message: error });
        }
    }

    async contextMenuRun(interaction) {
        try {
            const userExists = await this.checkIfUserExists(interaction);
            const guildExists = await this.checkIfGuildExists(interaction);

            // if user does not exist insert user into database
            if (!userExists) await this.insertUser(interaction);
            // if guild does not exist insert guild into database
            if (!guildExists) await this.insertGuild(interaction);

            return this.ok();
        } catch (error) {
            return this.error({ message: error });
        }
    }

    /**
     * Checks wether the user exists in our database.
     * @param interaction The interaction to use.
     */
    async checkIfUserExists(interaction) {
        // check if user exists in database
        const result = await DB(`SELECT * FROM users WHERE Id = ?`, [interaction.user.id])
        // if user does not exist return false
        return result ? true : false
    }

    /**
     * Checks wether a guild exists in our database.
     * @param interaction The interaction to use.
     */
    async checkIfGuildExists(interaction) {
        // check if guild exists in database
        const result = await DB(`SELECT * FROM guilds WHERE Id = ?`, [interaction.guildId])
        // if guild does not exist return false
        return result ? true : false
    }

    /**
     * Insert a user into our database.
     * @param interaction The interaction to use.
     */
    async insertUser(interaction) {
        // insert user into database
        await DB(`INSERT INTO users (Id, UserStatsId, Coins) VALUES (?, ?, ?)`, [interaction.user.id, null, 0]);
    }

    /**
     * Insert a guild into our database.
     * @param interaction The interaction to use.
     */
    async insertGuild(interaction) {
        // insert guild into database
        await DB(`INSERT INTO guilds (Id, LanguageId) VALUES (?, ?)`, [interaction.guildId, null]);
    }

}