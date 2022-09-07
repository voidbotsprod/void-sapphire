import { Listener } from "@sapphire/framework";

export class Ready extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            once: true,
            event: "ready"
        });
    }

    async run(client) {
        const { username, id } = client.user;

        console.log("----------------------")
        this.container.logger.info(`Logged in as ${username} [${id}]`)
        // vvv used to reset all slash commands if required
        // await client.application.commands.set([])
    }
}