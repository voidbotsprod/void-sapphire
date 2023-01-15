import { AllFlowsPrecondition } from '@sapphire/framework';

export class ModeratorOnlyPrecondition extends AllFlowsPrecondition {
	#message = 'This command can only be used by the server moderators.';

	chatInputRun(interaction) {
		return this.doModeratorCheck(interaction.user.id, interaction);
	}

	contextMenuRun(interaction) {
		return this.doModeratorCheck(interaction.user.id, interaction);
	}

	messageRun(message) {
		return this.doModeratorCheck(message.author.id, message);
	}

	/**
	 * Checks wether a user is a bot owner.
	 * @param {string} userId The user to check.
	 * @param {Interaction} interaction The interaction to check.
	 */
	doModeratorCheck(userId, interaction) {
		// Check if the user has admin permissions
		return interaction.member.permissions.has('ADMINISTRATOR') ? this.ok() : this.error({ message: this.#message });
	}
}
