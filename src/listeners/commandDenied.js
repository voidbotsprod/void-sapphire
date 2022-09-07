const { Listener } = require('@sapphire/framework');

class commandDenied extends Listener {
    async run(error, { message }) {
        if (error.context.silent) return;
        return message.channel.send({ content: error.message });
    }
}

module.exports = { commandDenied };