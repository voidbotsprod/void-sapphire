import { AllFlowsPrecondition } from '@sapphire/framework';

export class OwnerOnlyPrecondition extends AllFlowsPrecondition {
    #message = 'This command can only be used by the owner.';

    chatInputRun(interaction) {
        return this.doOwnerCheck(interaction.user.id);
    }

    contextMenuRun(interaction) {
        return this.doOwnerCheck(interaction.user.id);
    }

    messageRun(message) {
        return this.doOwnerCheck(message.author.id);
    }

    /**
     * Checks wether a user is a bot owner.
     * @param {string} userId The user to check.
     */
    doOwnerCheck(userId) {
        return process.env.OWNERS.split(',').includes(userId) ? this.ok() : this.error({ message: this.#message });
    }
}
