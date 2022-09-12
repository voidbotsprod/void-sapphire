import { Listener } from '@sapphire/framework';

export class commandDeniedEvent extends Listener {
    async run(error, { message }) {
        if (error.context.silent) return;
        return message.channel.send({ content: error.message });
    }
}