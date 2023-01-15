/**
 * Default variables for language passthrough
 * @returns {Object} Default variables
 */
function DEFAULT_VARIABLES(interaction, client) {
    const vars = {
        '%AUTHOR_USERNAME%': interaction.user.username,
        '%AUTHOR_TAG%': interaction.user.tag,
        '%BOT_USERNAME%': client.user.username,
        '%BOT_TAG%': client.user.tag,
        '%GUILD_NAME%': interaction.guild.name,
        '%BOT_INVITE%': `https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=1342565446`,
        '(%NOTE).*\-(.*)(%)': ''
    }
    return vars;
}

export default DEFAULT_VARIABLES;