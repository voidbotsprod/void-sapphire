import { RandomLoadingMessage } from '#lib/constants';
import { container } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';
import { isNullish, isNullishOrZero } from '@sapphire/utilities';

/**
 * Shortens a text.
 * @param {string} input Input string
 * @param {number} from Start index
 * @param {number} to End index
 * @param {boolean} ending Should the string end with '...'?
 * @returns Formatted string
 */
export function cutTo(input = 'error', from = 0, to = 250, ending = true) {
    /* NOTE: Does not check for ' '(spaces) */
    if (input.length > to) {
        let output = input.substring(from, to);
        return ending ? (output += '...') : output;
    } else {
        return input;
    }
}

/**
 * Wraps a string to fit into a certain length.
 * @param {string} input String to be wrapped
 * @param {number} length Length of each line
 * @returns Wrapped string
*/
export function softWrap(input, length = 30) {
    const wrap = input.replace(new RegExp(`(?![^\\n]{1,${length}}$)([^\\n]{1,${length}})\\s`, 'g'), '$1\n');

    return wrap;
}

/**
 * Capitalizes a given string.
 * @param {string} toCapitalize String to capitalize.
 * @return {string} capitalized string
 */
export function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Picks a random element from an array and returns it.
 * @param {Array} array Array to pick from.
 * @return a random item
 */
export function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Sends a random loading message, which are defined in `#lib/constants`.
 * @param Message The message to send the random response with.
 */
export function sendLoadingMessage(interaction) {

    return interaction.reply({
        content: 'Successfully unregistered all **guild** application commands.\nYou will need to update the idHints after the next start.',
        embeds: [new MessageEmbed().setDescription(pickRandom(RandomLoadingMessage)).setColor(container.color.GREYPLE)],
        ephemeral: true,
        fetchReply: false
    });
}

/**
 * Checks whether a user should be rate limited.
 * @param param0 The parameters for this function
 * @returns `true` if the user should be rate limited, `false` otherwise
 */
export function isRateLimited({ time, request, response, manager, auth = false }) {
    if (isNullishOrZero(time) || isNullish(request) || isNullish(response) || isNullish(manager)) {
        return false;
    }
    const id = auth ? request.auth.id : request.headers['x-api-key'] || request.socket.remoteAddress;
    const bucket = manager.acquire(id);
    response.setHeader('Date', new Date().toUTCString());
    response.setHeader('X-RateLimit-Limit', time);
    response.setHeader('X-RateLimit-Remaining', bucket.remaining.toString());
    response.setHeader('X-RateLimit-Reset', bucket.remainingTime.toString());
    if (bucket.limited) {
        response.setHeader('Retry-After', bucket.remainingTime.toString());
        return true;
    }
    try {
        bucket.consume();
    } catch { }
    return false;
}

/**
 * 
 * @param {string} query The query to use
 * @param {Array<Object>} data The data to search through
 * @returns result
 */
export async function DB(query, data) {
    const result = await dbPool.execute(query, data);
    return result[0][0];
}