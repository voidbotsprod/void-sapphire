import { Command } from '@sapphire/framework';
import { Stopwatch } from '@sapphire/stopwatch';
import { Time } from '@sapphire/time-utilities';
import { codeBlock, isThenable } from '@sapphire/utilities';
import { inspect } from 'node:util';
import { PasteGG } from 'paste.gg';

export class Eval extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'eval',
			description: 'Evaluates code.',
			preconditions: ['ownerOnly']
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) => {
				builder
					.setName(this.name)
					.setDescription(this.description)
					.addStringOption((option) => option.setName('code').setDescription('The code to evaluate.').setRequired(true))
					.addBooleanOption((option) => option.setName('async').setDescription('Whether the code should be evaluated asynchronously.').setRequired(false));
			},
			{
				guildIds: ['975124858298040451'], // guilds for the command to be registered in; global if empty
				idHints: '1018626868800389120' // commandId, define after registering (id will be in log after first run)
			}
		);
	}

	// Run the slash command
	async chatInputRun(interaction) {
		let code = interaction.options.getString('code');
		let isAsync = interaction.options.getBoolean('async');
		if (!isAsync) isAsync = false;

		const { success, time, result, thenable } = await this.eval(code, interaction, isAsync);

		if (success && thenable) return result;

		return interaction.reply({ content: `${result.length > 2000 ? await this.getPaste(result, code).catch((err) => codeBlock('js', err)) : codeBlock('js', result)}\n${time}` });
	}

	/**
	 * Evaluates code.
	 * @param  {string} code The code to evaluate.
	 * @param  {Interaction} interaction The interaction that handles the code.
	 * @param  {boolean} async Whether the code should be evaluated asynchronously.
	 * @return {Object|string} The result; either an error object, an object or a string. Might also return nothing. Depends on its mood.
	 */
	async eval(code, interaction, isAsync) {
		let success;
		let syncTime;
		let asyncTime;
		let result;
		let thenable = false;

		const stopwatch = new Stopwatch();
		try {
			if (isAsync) code = `(async () => {\n${code}\n})();`;

			result = eval(code);
			syncTime = stopwatch.toString();

			if (isThenable(result)) {
				thenable = true;
				stopwatch.restart();
				asyncTime = stopwatch.toString();
			}

			if (typeof result !== 'string') {
				result = result instanceof Error ? result.stack : inspect(result, { depth: 0 });
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

	/**
	 * Gets a paste.gg link.
	 * @param  {string} syncTime Time needed to run the command.
	 * @param  {string} asyncTime Time needed to run the command and the time needed to run the rest asynchronously.
	 * @return {string} Formatted time display as a string.
	 */
	formatTime(syncTime, asyncTime) {
		return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
	}

	/**
	 * Gets a paste.gg link.
	 * @param  {string} text The text to put in the paste.
	 * @param  {string} description Short paste description.
	 * @return {string} Link to paste or the error message.
	 */
	async getPaste(text, description) {
		try {
			const client = new PasteGG();
			let paste = await client.post({
				name: 'eval',
				expires: new Date(Date.now() + Time.Minute * 2).toISOString(),
				description: description,
				files: [
					{
						name: 'eval.js',
						content: { format: 'text', highlight_language: 'javascript', value: text }
					}
				]
			});

			if (paste.status == 'error') return `\n${paste.message}`;

			return `\n${paste.result.url}`;
		} catch (err) {
			return `\n${err}`;
		}
	}
}
