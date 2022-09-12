import { Listener } from '@sapphire/framework';

export class chatInputCommandDeniedEvent extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            once: false,
            event: 'chatInputCommandDenied'
        });
    }

    async run(event) {
        console.log(`Chat input event denied: ${event}`);
        event.defer();
        return;
    }
}