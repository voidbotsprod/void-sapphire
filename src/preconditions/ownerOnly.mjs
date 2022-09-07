import { Precondition } from "@sapphire/framework";
const OWNERS = process.env.OWNERS.split(",");

export class ownerOnly extends Precondition {
    isOwner(message, input) {
        return input.includes(message.user.id)
    }

    async chatInputRun(interaction) {
        return this.isOwner(interaction, OWNERS)
            ? this.ok()
            : this.error({ message: "Only the bot owner can use this command.", context: { silent: true } })
    }
}