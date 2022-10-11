import { Listener } from '@sapphire/framework';

export class chatInputCommandDeniedEvent extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            once: false,
            event: 'chatInputCommandDenied'
        });
    }

    async run(interaction) {
        return client.logger.error(`Event cancelled: ${interaction}`);
    }
}