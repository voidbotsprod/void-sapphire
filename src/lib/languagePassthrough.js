import { default as DEFAULT_VARIABLES } from './languageVariables.js';
import fs from 'fs/promises';

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
    const guildLanguage = await guildLanguages.find(c => c.guildId == interaction.guild.id);
    // Get language file
    let languageFile;
    let filePath;

    if (guildLanguage !== undefined) filePath = `./src/languages/${guildLanguage.languageId}.json`;
    else filePath = './src/languages/1.json';

    try {
        const jsonData = await fs.readFile(filePath, 'utf8');
        languageFile = await JSON.parse(jsonData);
    } catch (error) { console.log(error) }

    // If the text code doesn't exist, return an error message
    if (!languageFile[textCode]) return `I couldn't translate this message. [Report Here](https://tenor.com/bIS09.gif)`;
    // Define variables
    const mergedVariables = {
        ...customVariables,
        ...DEFAULT_VARIABLES(interaction, client)
    }

    // Replace variables
    const textToTranslate = languageFile[textCode]
    const translated = await Object.entries(mergedVariables).reduce((acc, [key, value]) => acc.replace(key, value), textToTranslate);
    // Return translated string

    return await translated;
}