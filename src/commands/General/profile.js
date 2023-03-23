import { Command } from '@sapphire/framework';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { AttachmentBuilder } from 'discord.js';
import { cutTo, contrast, DB, invertHexColor, hexToGrayscale, drawInventory, drawCanvasLine, drawFrame, colorLuminance } from '#lib/functions';
import { getPalette } from '#lib/color-thief-node';
import { request } from 'undici';
import approx from 'approximate-number';

export class ProfileCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'profile',
			description: 'Profile viewer.',
			preconditions: ['ownerOnly', 'insertGuildsAndUsers']
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) => {
				builder
					.setName(this.name)
					.setDescription(this.description)
					.addUserOption((option) => option.setName('target').setDescription('User whos profile should be checked.'));
			},
			{
				guildIds: ['975124858298040451'], // guilds for the command to be registered in; global if empty
				idHints: '1028691095657394236' // commandId, define after registering (id will be in log after first run)
			}
		);
	}

	async chatInputRun(interaction) {
		let providedUser;
		if (interaction.options.getUser('target')) providedUser = interaction.options.getUser('target');
		else providedUser = interaction.user;

		try {
			// Create canvas
			const canvas = createCanvas(700, 250);
			const ctx = canvas.getContext('2d');
			ctx.antialias = 'none';
			ctx.patternQuality = 'fast';
			ctx.textDrawingMode = 'glyph';
			ctx.imageSmoothingEnabled = false;
			// Define stuff for later
			const userData = await DB(`SELECT * FROM users WHERE Id = ?`, [providedUser.id]);
			const Coins = userData === undefined ? 0 : userData.Coins;
			const Xp = userData === undefined ? 0 : userData.Xp;
			let currentLevel = Math.floor(Xp / 5000) + 1;
			// Draw background and load base image
			ctx.fillStyle = '#2C2F33';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			const base = await loadImage('src/lib/images/profile/border/base_transparent.png');
			ctx.drawImage(base, 0, 0, canvas.width, canvas.height);
			// Top line
			drawCanvasLine(ctx, 20, 50, base.width - 20, 50, '#36373D', 0.5);
			// Far left line
			drawCanvasLine(ctx, 20, 20, 20, 230, '#36373D', 0.5);
			// Middle left "Crossing" line
			drawCanvasLine(ctx, 200, 20, 200, 230, '#36373D', 0.5);
			// Middle right "Crossing" line
			drawCanvasLine(ctx, 437, 50, 437, 230, '#36373D', 0.5);
			// Draw elements
			await this.drawPlayerCard(ctx, interaction, currentLevel, providedUser);
			await drawInventory(ctx, providedUser.id, 3, 4, 15, 15, 43, 210, 60, 10, 20, 53, 8);
			await this.drawTitleBar(ctx, currentLevel, Coins, Xp, base);
			await this.drawStats(ctx);
			// Creating a new message attachment
			const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'));
			// Send reply
			await interaction.reply({ files: [attachment] });
		} catch (error) {
			console.log(error);
		}
	}

	async drawPlayerCard(ctx, interaction, currentLevel, providedUser) {
		// Define gradient
		const lightGrayGradient = ctx.createLinearGradient(0, 20, 0, 40);
		lightGrayGradient.addColorStop(0.0, 'white');
		lightGrayGradient.addColorStop(1.0, '#C0C4D8');
		// Guild
		ctx.font = '20px Minecraft';
		ctx.fillStyle = '#000000';
		ctx.textAlign = 'center';
		ctx.fillText(cutTo(interaction.guild.name, 0, 13, true), 110, 40);
		ctx.fillStyle = lightGrayGradient;
		ctx.fillText(cutTo(interaction.guild.name, 0, 13, true), 111, 39);
		// Avatar
		const { body } = await request(providedUser.displayAvatarURL({ extension: 'png', size: 256 }));
		const avatar = await loadImage(await body.arrayBuffer());
		ctx.drawImage(avatar, 60, 90, 100, 100);
		contrast(ctx, 60, 90, 100, 100, 8.5);
		// Frame
		await drawFrame(ctx, currentLevel, 60, 90, 100, 100);
		// Username
		let hexArray = [];
		const RGBPalette = await getPalette(providedUser.displayAvatarURL({ extension: 'png', size: 256 }), 10, 3);
		for (const color of RGBPalette) {
			const hex = '#' + ((1 << 24) + (color[0] << 16) + (color[1] << 8) + color[2]).toString(16).slice(1);
			hexArray.push(hex);
		}
		const lightestColor = hexArray.sort((c) => colorLuminance(c).value < 0.5).shift();
		ctx.font = '20px Minecraft';
		ctx.fillStyle = invertHexColor(hexToGrayscale(lightestColor));
		ctx.fillText(cutTo(providedUser.username, 0, 13, true), 109, 76);
		ctx.fillStyle = lightestColor;
		ctx.textAlign = 'center';
		ctx.fillText(cutTo(providedUser.username, 0, 13, true), 110, 75);
	}

	async drawTitleBar(ctx, currentLevel, Coins, Xp, base) {
		// Level icon and text
		const levelIcon = await loadImage('src/lib/images/profile/gui/levelIcon.png');
		const canvasIsExtremelyDumb = `${currentLevel}`;
		ctx.drawImage(levelIcon, 210, 22, 19, 19);
		ctx.font = '16px Minecraft';
		ctx.fillStyle = '#FFFFFF';
		ctx.textAlign = 'left';
		ctx.fillText(canvasIsExtremelyDumb, 235, 38);
		// XP icon and text
		const levelLength = ctx.measureText(canvasIsExtremelyDumb);
		const xpIcon = await loadImage('src/lib/images/profile/gui/xpIcon.png');
		ctx.drawImage(xpIcon, 230 + levelLength.width + 15, 22, 19, 19);
		ctx.font = '16px Minecraft';
		ctx.fillStyle = '#FFFFFF';
		ctx.textAlign = 'left';
		ctx.fillText(approx(Xp), 250 + levelLength.width + 24, 38);
		// Coins icon and text
		const coinsIcon = await loadImage('src/lib/images/profile/gui/coinIcon.png');
		ctx.drawImage(coinsIcon, base.width - 40, 22, 18, 18);
		ctx.font = '16px Minecraft';
		ctx.fillStyle = '#FFFFFF';
		ctx.textAlign = 'right';
		ctx.fillText(approx(Coins, { min10k: true }), base.width - 48, 37);
	}

	async drawStats(ctx) {
		// Stats text
		ctx.font = '16px Minecraft';
		ctx.fillStyle = '#FFFFFF';
		ctx.textAlign = 'left';
		ctx.fillText(`• Stat One: 10`, 447, 78);
		ctx.fillText(`• Stat Two: 20`, 447, 125);
		ctx.fillText(`• Stat Three: 30`, 447, 172);

		ctx.font = '8px Minecraft';
		ctx.fillStyle = '#474A4D';
		ctx.fillText(cutTo(`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`, 0, 60, true), 447, 219);

		// Stats subtext
		ctx.font = '10px Minecraft';
		ctx.fillStyle = '#CDCDCE';
		ctx.textAlign = 'left';
		ctx.fillText(cutTo(`More detailed explanation of something or other.`, 0, 40), 457, 93);
		ctx.fillText(cutTo(`More detailed explanation of something or other.`, 0, 40), 457, 140);
		ctx.fillText(cutTo(`More detailed explanation of something or other.`, 0, 40), 457, 187);
	}
}
