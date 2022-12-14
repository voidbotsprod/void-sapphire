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
    if (input.length > to) {
        // check if the last character before the ... is a space and remove it
        if (input.charAt(to - 1) === ' ') {
            return input.substring(from, to - 1) + (ending ? '...' : '');
        }
        return input.substring(from, to) + (ending ? '...' : '');
    }
    return input;
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

/**
 * 
 * @param {*} ctx The context to use
 * @param {number} x The x position 
 * @param {number} y The y position 
 * @param {number} width The width of the image 
 * @param {number} height The height of the image 
 * @returns Greyscale image
 */
export function greyscale(ctx, x, y, width, height) {
    const data = ctx.getImageData(x, y, width, height);
    for (let i = 0; i < data.data.length; i += 4) {
        const brightness = (0.24 * data.data[i]) + (0.5 * data.data[i + 1]) + (0.16 * data.data[i + 2]);
        data.data[i] = brightness;
        data.data[i + 1] = brightness;
        data.data[i + 2] = brightness;
    }
    ctx.putImageData(data, x, y);
    return ctx;
}

/**
 * 
 * @param {*} ctx The context to use
 * @param {number} x The x position
 * @param {number} y The y position
 * @param {number} width The width of the image
 * @param {number} height The height of the image
 * @param {number} multiplier The multiplier to use
 * @returns Modified Context
 */
export function contrast(ctx, x, y, width, height, multiplier = 10) {
    const data = ctx.getImageData(x, y, width, height);
    const factor = (multiplier*10 / 100);
    const intercept = 128 * (1 - factor);
    for (let i = 0; i < data.data.length; i += 4) {
        data.data[i] = (data.data[i] * factor) + intercept;
        data.data[i + 1] = (data.data[i + 1] * factor) + intercept;
        data.data[i + 2] = (data.data[i + 2] * factor) + intercept;
    }
    ctx.putImageData(data, x, y);
    return ctx;
}

/**
     * Checks wether the user exists in our database.
     * @param interaction The interaction to use.
     */
 export async function checkIfUserExists(interaction) {
    // check if user exists in database
    const result = await DB(`SELECT * FROM users WHERE Id = ?`, [interaction.user.id])
    // if user does not exist return false
    return result ? true : false
}

/**
 * Checks wether a guild exists in our database.
 * @param interaction The interaction to use.
 */
export async function checkIfGuildExists(interaction) {
    // check if guild exists in database
    const result = await DB(`SELECT * FROM guilds WHERE Id = ?`, [interaction.guildId])
    // if guild does not exist return false
    return result ? true : false
}

/**
 * Insert a user into our database.
 * @param interaction The interaction to use.
 */
export async function insertUser(interaction) {
    // insert user into database
    await DB(`INSERT INTO users (Id, Coins, Xp) VALUES (?, ?, ?)`, [interaction.user.id, 0, 0]);
}

/**
 * Insert a guild into our database.
 * @param interaction The interaction to use.
 */
export async function insertGuild(interaction) {
    // insert guild into database
    await DB(`INSERT INTO guilds (Id, LanguageId) VALUES (?, ?)`, [interaction.guildId, null]);
}