import { AllFlowsPrecondition } from '@sapphire/framework';
import { checkIfUserExists, checkIfGuildExists, insertUser, insertGuild } from '#lib/functions';

export class insertGuildsAndUsersPrecondition extends AllFlowsPrecondition {
	async chatInputRun(interaction) {
		try {
			const userExists = await checkIfUserExists(interaction);
			const guildExists = await checkIfGuildExists(interaction);

			// if user does not exist insert user into database
			if (!userExists) await insertUser(interaction);
			// if guild does not exist insert guild into database
			if (!guildExists) await insertGuild(interaction);

			return this.ok();
		} catch (error) {
			return this.error({ message: error });
		}
	}

	async contextMenuRun(interaction) {
		try {
			const userExists = await checkIfUserExists(interaction);
			const guildExists = await checkIfGuildExists(interaction);

			// if user does not exist insert user into database
			if (!userExists) await insertUser(interaction);
			// if guild does not exist insert guild into database
			if (!guildExists) await insertGuild(interaction);

			return this.ok();
		} catch (error) {
			return this.error({ message: error });
		}
	}
}
