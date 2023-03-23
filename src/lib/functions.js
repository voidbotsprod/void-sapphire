import { RandomLoadingMessage } from '#lib/constants';
import { container } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { isNullish, isNullishOrZero } from '@sapphire/utilities';
import { default as DEFAULT_VARIABLES } from './languageVariables.js';
import { loadImage } from 'canvas';
import fs from 'fs/promises';
import replaceOnce from 'replace-once';

/**
 * Function for language passthrough, replaces the text with the language specified
 *
 * @param {any} interaction Interaction
 * @param {string} textCode String specified in the language file
 * @param {Object} customVariables Custom variables to replace ( '%VAR%': 'value' )
 * @returns Translated string
 */
export default async (interaction, textCode, customVariables = {}) => {
	// This is the ugliest code I've ever written
	// Find guild language in cache
	const guildLanguage = await global.guildLanguages.find((c) => c.guildId == interaction.guild.id);
	// Get language file
	let languageFile;
	let filePath;

	if (guildLanguage !== undefined) filePath = `./src/languages/${guildLanguage.languageId}.json`;
	else filePath = './src/languages/1.json';

	try {
		const jsonData = await fs.readFile(filePath, 'utf8');
		languageFile = await JSON.parse(jsonData);
	} catch (error) {
		console.log(error);
	}

	// If the text code doesn't exist, return an error message
	if (!languageFile[textCode]) return `I couldn't translate this message. [Report Here](https://tenor.com/bIS09.gif)`;
	// Define variables
	const mergedVariables = {
		...customVariables,
		...DEFAULT_VARIABLES(interaction, client)
	};

	// Replace variables
	const textToTranslate = languageFile[textCode];
	const translated = replaceOnce(textToTranslate, Object.keys(mergedVariables), Object.values(mergedVariables), 'gmi');
	// Return translated string

	return translated;
};

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
 * Check if a color is dark or light.
 * @param {string} color Color to be checked (HEX or RGB)
 * @returns {object} Object containing the raw luminance value and the luminance type (dark or light)
 */
export function colorLuminance(color) {
	let r, g, b;
	if (color.startsWith('#')) {
		// Hex color
		r = parseInt(color.slice(1, 3), 16);
		g = parseInt(color.slice(3, 5), 16);
		b = parseInt(color.slice(5, 7), 16);
	} else if (color.startsWith('rgb')) {
		// RGB or RGBA color
		const values = color.match(/\d+/g).map(Number);
		r = values[0];
		g = values[1];
		b = values[2];
	}
	let amount = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	amount = amount.toFixed(2);
	amount === 'NaN' ? (amount = '1') : (amount = amount);

	const luminance = amount > 0.5 ? 'dark' : 'light';
	return { amount: amount, luminance: luminance };
}

/**
 * Inverts the colors of a canvas area.
 * @param {any} ctx Canvas context
 * @param {number} x X position
 * @param {number} y Y position
 * @param {number} width Width
 * @param {number} height Height
 * @returns Inverted area of the canvas
 */
export function invertCanvasColors(ctx, x, y, width, height) {
	const imageData = ctx.getImageData(x, y, width, height);
	const data = imageData.data;
	for (let i = 0; i < data.length; i += 4) {
		data[i] = 255 - data[i];
		data[i + 1] = 255 - data[i + 1];
		data[i + 2] = 255 - data[i + 2];
	}
	return ctx.putImageData(imageData, x, y);
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
		embeds: [new EmbedBuilder().setDescription(pickRandom(RandomLoadingMessage)).setColor(container.color.GREYPLE)],
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
	} catch {}
	return false;
}

/**
 * Main function for accessing the database
 *
 * @param {string} query The query to use
 * @param {Array<Object>} data The data to search through
 * @param {boolean} raw Should the result be unformatted?
 * @returns result
 */
export async function DB(query, data, raw = false) {
	try {
		const result = await dbPool.execute(query, data);
		if (raw) return result;
		return result[0][0];
	} catch (err) {
		() => {};
	}
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
		const brightness = 0.24 * data.data[i] + 0.5 * data.data[i + 1] + 0.16 * data.data[i + 2];
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
	const factor = (multiplier * 10) / 100;
	const intercept = 128 * (1 - factor);
	for (let i = 0; i < data.data.length; i += 4) {
		data.data[i] = data.data[i] * factor + intercept;
		data.data[i + 1] = data.data[i + 1] * factor + intercept;
		data.data[i + 2] = data.data[i + 2] * factor + intercept;
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
	const result = await DB(`SELECT * FROM users WHERE Id = ?`, [interaction.user.id]);
	// if user does not exist return false
	return result ? true : false;
}

/**
 * Checks wether a guild exists in our database.
 * @param interaction The interaction to use.
 */
export async function checkIfGuildExists(interaction) {
	// check if guild exists in database
	const result = await DB(`SELECT * FROM guilds WHERE Id = ?`, [interaction.guildId]);
	// if guild does not exist return false
	return result ? true : false;
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

/**
 * Draws the inventory image
 * @param {any} ctx The context to use
 * @param {any} interaction The interaction to use
 * @param {number} rows Number of rows
 * @param {number} columns Number of columns
 * @param {number} gap Gap between slots in px
 * @param {number} size Size of the slots in px
 * @returns The inventory image
 */
export async function drawInventory(ctx, userId, rows, columns, gapX, gapY, size, xPos, yPos, fontSize, itemTagOffsetX, itemTagOffsetY, cutTextAt) {
	try {
		const [items] = await DB('SELECT * FROM useritems WHERE UserId = ?', [userId], true);
		// Drawing inventory slots in a grid
		const slotImage = await loadImage('src/lib/images/profile/gui/inventorySlot.png');
		// Draw slots
		for (let i = 0; i < rows * columns; i++) {
			const x = xPos - 1 + (i % columns) * (size + gapX);
			const y = yPos - 1 + Math.floor(i / columns) * (size + gapY);
			ctx.drawImage(slotImage, x, y, size, size);
		}
		// Draw items
		if (items) {
			for (let i = 0; i < Math.min(items.length, 12); i++) {
				if (i > 12) return;
				// Set draw location
				const x = xPos + (i % columns) * (size + gapX);
				const y = yPos + Math.floor(i / columns) * (size + gapY);
				const currentItem = itemList.find((item) => item.Id === items[i].ItemTypeId);
				const itemTexture = await loadImage(`src/lib/images/items/${currentItem.Name}.png`).catch(() => {});
				const item = itemTexture !== undefined ? itemTexture : await loadImage(`src/lib/images/items/default.png`);
				ctx.drawImage(item, x, y, size - 2, size - 2);
				const rarity = rarityList.find((rarity) => rarity.Id === currentItem.Rarity);
				const colorValue = colorList.find((color) => color.Id === rarity.ColorId).Value;
				const grayScaleColor = hexToGrayscale(colorValue, 30);
				// Draw item name under slot
				ctx.font = `${fontSize}px Minecraft`;
				ctx.fillStyle = grayScaleColor;
				ctx.textAlign = 'center';
				ctx.fillText(cutTo(currentItem.DecoName, 0, cutTextAt, true), x + itemTagOffsetX, y + (itemTagOffsetY + 1));
				ctx.fillStyle = colorValue;
				ctx.fillText(cutTo(currentItem.DecoName, 0, cutTextAt, true), x + (itemTagOffsetX + 1), y + itemTagOffsetY);
			}
		}
	} catch (error) {
		console.log(error);
	}
}

export async function drawFrame(ctx, currentLevel, x, y, width, height) {
	const baseFramesURL = 'src/lib/images/profile/avatarBorder/';
	const frames = {
		50: '1_frame_rookie.png',
		100: '2_frame_recruit.png',
		150: '3_frame_scout.png',
		200: '4_frame_knight.png',
		250: '5_frame_king.png',
		300: '6_frame_emperor.png',
		350: '7_frame_overlord.png'
	};

	// Frame around avatar
	let fitsWithinLevel;
	for (const [level] of Object.entries(frames)) {
		if (currentLevel < level) {
			fitsWithinLevel = level;
			break;
		} else {
			fitsWithinLevel = 350;
			break;
		}
	}
	const frame = await loadImage(baseFramesURL + frames[fitsWithinLevel]);
	ctx.drawImage(frame, x, y, width, height);
	return ctx;
}

/**
 * Draws lines on the canvas
 * @param {any} ctx The context to use
 * @param {number} x1  The x position of the first point
 * @param {number} y1 The y position of the first point
 * @param {number} x2 The x position of the second point
 * @param {number} y2 The y position of the second point
 * @param {string} color The color of the line (hex)
 * @param {number} width The width of the line
 */
export function drawCanvasLine(ctx, x1, y1, x2, y2, color, width) {
	try {
		ctx.strokeStyle = color;
		ctx.lineWidth = width;
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
	} catch (error) {
		console.log(error);
	}
}

/**
 * Inverts a hex color
 * @param {string} hex The hex color to invert
 * @returns The inverted hex color string
 */
export function invertHexColor(hex) {
	if (hex.indexOf('#') === 0) hex = hex.slice(1);
	// Convert 3-digit hex to 6-digits
	if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	// Check if hex is valid
	if (hex.length !== 6) throw new Error('Invalid HEX color.');
	// Invert color components
	const r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
		g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
		b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
	// Pad with zeros and return
	const padZero = (str) => (str.length === 1 ? '0' + str : str);
	return '#' + padZero(r) + padZero(g) + padZero(b);
}

/**
 * Converts a hex color to grayscale (only averaged, not "truly" grayscale)
 * @param {string} hex The hex color to convert
 * @param {number} reduceBy Should the output be reduced in lightness?
 * @returns The grayscale hex color string
 */
export function hexToGrayscale(hex, reduceBy = 0) {
	if (hex.indexOf('#') === 0) hex = hex.slice(1);
	// Convert 3-digit hex to 6-digits
	if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	// Check if hex is valid
	if (hex.length !== 6) throw new Error('Invalid HEX color.');
	// Convert to grayscale
	let r = parseInt(hex.slice(0, 2), 16),
		g = parseInt(hex.slice(2, 4), 16),
		b = parseInt(hex.slice(4, 6), 16),
		gray = (r + g + b) / 3 - reduceBy;
	gray = gray < 0 ? 0 : gray;
	// Return as a hex value
	return '#' + Math.round(gray).toString(16) + Math.round(gray).toString(16) + Math.round(gray).toString(16);
}
