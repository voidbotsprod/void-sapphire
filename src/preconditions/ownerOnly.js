const { Precondition } = require("@sapphire/framework");
const OWNERS = process.env.OWNERS.split(",");

class ownerOnly extends Precondition {
    isOwner(message, input, type) {
        if (type == "messageRun") return input.includes(message.author.id)
        if (type == "chatInputRun") return input.includes(message.user.id)
    }

    async messageRun(message) {
        return this.isOwner(message, OWNERS, "messageRun")
            ? await this.ok()
            : this.error({ message: "Only the bot owner can use this command.", context: { silent: true } })
    }

    async chatInputRun(interaction) {
        return this.isOwner(interaction, OWNERS, "chatInputRun")
            ? this.ok()
            : this.error({ message: "Only the bot owner can use this command.", context: { silent: true } })
    }
}

module.exports = { ownerOnly };