import { Command } from '@sapphire/framework';
import { Stopwatch } from '@sapphire/stopwatch';
import { Time } from '@sapphire/time-utilities';
import { codeBlock, isThenable } from '@sapphire/utilities';
import { inspect } from 'node:util';
import { PasteGG } from "paste.gg";

export class Eval extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'eval',
            /* aliases: ['e', 'ev'], */ // aliases are not supported for slash commands
            description: 'Evaluate code.',
            preconditions: ["ownerOnly"]
        });
    }

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => {
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addBooleanOption((option) =>
                    option
                        .setName("async")
                        .setDescription("Whether the code should be evaluated asynchronously.")
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("code")
                        .setDescription("The code to evaluate.")
                        .setRequired(true)
                )
        }, {
            guildIds: ['975124858298040451'], // guilds for the command to be registered in; global if empty
            idHints: '1017143173321064618', // commandId, define after registering (id will be in log after first run)
        })
    }

    // Run the slash command
    async chatInputRun(interaction) {
        const code = interaction.options.getString("code", true);
        const async = interaction.options.getBoolean("async", false);
        const { success, time, result, thenable } = await this.eval(code, interaction, async);

        if (success && thenable) return result;

        return interaction.reply({ content: `${result.length > 2000 ? await this.getPaste(result, code).catch((err) => codeBlock('js', err)) : codeBlock('js', result)}\n${time}` });
    }

    async eval(code, interaction, async) {
        let success;
        let syncTime;
        let asyncTime;
        let result;
        let thenable = false;

        const stopwatch = new Stopwatch();
        try {
            if (async) code = `(async () => {\n${code}\n})();`;

            result = eval(code);
            syncTime = stopwatch.toString();

            if (typeof result !== 'string') {
                result = result instanceof Error ? result.stack : inspect(result, { depth: 0 });
            }

            if (isThenable(result)) {
                thenable = true;
                stopwatch.restart();
                asyncTime = stopwatch.toString();
            }

            stopwatch.stop();
            success = true;

        } catch (error) {
            if (!syncTime) syncTime = stopwatch.toString();
            if (thenable && !asyncTime) asyncTime = stopwatch.toString();
            result = error.toString();

            success = false;
            stopwatch.stop();
        }

        return {
            success,
            time: this.formatTime(syncTime, asyncTime ?? ''),
            result: result,
            thenable
        };
    }

    formatTime(syncTime, asyncTime) {
        return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
    }

    async getPaste(value, desc) {
        try {
            const client = new PasteGG();
            let paste = await client.post({
                name: 'eval',
                expires: new Date(Date.now() + Time.Minute * 2).toISOString(),
                description: desc,
                files: [{
                    name: 'eval.js',
                    content: {
                        format: 'text',
                        highlight_language: 'javascript',
                        value: value
                    }
                }]
            })

            if (paste.status == 'error') return `\n${paste.message}`

            return `\n${paste.result.url}`
        } catch (err) {
            return `\n${err}`;
        }
    }
}