import { RandomLoadingMessage } from '#lib/constants';
import { send } from '@sapphire/plugin-editable-commands';
import { MessageEmbed } from 'discord.js';

// TODO: add jsdoc
export function cutTo(input = 'error', from = 0, to = 250, ending = true) {
    /* NOTE: Does not check for ' '(spaces) */
    if (input.length > to) {
        let output = input.substring(from, to);
        if (ending) {
            return output + '...';
        } else {
            return output;
        }
    } else {
        //input = s;
        return input;
    }
}

// TODO: add jsdoc
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
export function sendLoadingMessage(message) {
	return send(message, { embeds: [new MessageEmbed().setDescription(pickRandom(RandomLoadingMessage)).setColor('#FF0000')] });
}