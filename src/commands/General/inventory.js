import { Command } from '@sapphire/framework';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { AttachmentBuilder } from 'discord.js';
import { drawInventory, drawCanvasLine, hexToGrayscale, invertHexColor, cutTo, contrast, colorLuminance, drawFrame, DB } from '#lib/functions';
import { getPalette } from '#lib/color-thief-node';
import { request } from 'undici';
import approx from 'approximate-number';

export class Inventory extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'inventory',
			description: 'Detailed inventory viewer.',
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
				idHints: process.env.NODE_ENV === 'PRODUCTION' ? null : '1088563875701592225'
			}
		);
	}

	async chatInputRun(interaction) {
		let providedUser;
		if (interaction.options.getUser('target')) providedUser = interaction.options.getUser('target');
		else providedUser = interaction.user;
		// Create canvas
		const canvas = createCanvas(700, 550);
		const ctx = canvas.getContext('2d');
		ctx.antialias = 'none';
		ctx.patternQuality = 'fast';
		ctx.textDrawingMode = 'glyph';
		ctx.imageSmoothingEnabled = false;
		// Draw background and load base image
		ctx.fillStyle = '#2C2F33';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		const base = await loadImage('src/lib/images/profile/border/inventory_base_transparent.png');
		ctx.drawImage(base, 0, 0, canvas.width, canvas.height);
		// Draw inventory
		const rows = 6;
		const columns = 4;
		const slotGap = 4;
		const slotGapX = 15;
		const slotGapY = 15;
		const slotSize = 50;
		const startingOffsetX = 20;
		const startingOffsetY = 100;
		await drawInventory(ctx, providedUser.id, rows, columns, slotGapX, slotGapY, slotSize, startingOffsetX, startingOffsetY, 10, 24, 58, 8);
		// Avatar and frame
		const { body } = await request(providedUser.displayAvatarURL({ extension: 'png', size: 256 }));
		const avatar = await loadImage(await body.arrayBuffer());
		ctx.drawImage(avatar, 20, 20, 67, 67);
		contrast(ctx, 20, 20, 67, 67, 8.5);
		const userData = await DB(`SELECT * FROM users WHERE Id = ?`, [providedUser.id]);
		const Coins = userData === undefined ? 0 : userData.Coins;
		const Xp = userData === undefined ? 0 : userData.Xp;
		let currentLevel = Math.floor(Xp / 5000) + 1;
		await drawFrame(ctx, currentLevel, 20, 20, 67, 67);
		// Draw lines
		const lineStartAt = columns * (slotSize + slotGap) + startingOffsetX + 45;
		await drawCanvasLine(ctx, lineStartAt, 20, lineStartAt, base.height - 46, '#36373D', 1);
		await drawCanvasLine(ctx, 20, base.height - 45, base.width - 20, base.height - 45, '#36373D', 1);
		// Draw basic user info but overcomplicate it for no reason
		let hexArray = [];
		const RGBPalette = await getPalette(providedUser.displayAvatarURL({ extension: 'png', size: 256 }), 10, 3);
		for (const color of RGBPalette) {
			const hex = '#' + ((1 << 24) + (color[0] << 16) + (color[1] << 8) + color[2]).toString(16).slice(1);
			hexArray.push(hex);
		}
		const lightestColor = hexArray.sort((c) => colorLuminance(c).value < 0.5).shift();
		// Username
		ctx.font = '24px Minecraft';
		ctx.textAlign = 'right';
		ctx.fillStyle = invertHexColor(hexToGrayscale(lightestColor));
		ctx.fillText(cutTo(providedUser.username, 0, 13, true), lineStartAt - 19, 41);
		ctx.fillStyle = lightestColor;
		ctx.fillText(cutTo(providedUser.username, 0, 13, true), lineStartAt - 18, 40);
		// Coins icon and text
		const coinsIcon = await loadImage('src/lib/images/profile/gui/coinIcon.png');
		ctx.drawImage(coinsIcon, lineStartAt - 36, 70, 18, 18);
		ctx.font = '15.3px Minecraft';
		ctx.fillStyle = '#d1d1d1';
		ctx.textAlign = 'right';
		ctx.fillText(approx(Coins, { min10k: true }), lineStartAt - 40, 85);
		// Level icon and text
		const levelIcon = await loadImage('src/lib/images/profile/gui/levelIcon.png');
		const canvasIsExtremelyDumb = `${currentLevel}`;
		ctx.drawImage(levelIcon, lineStartAt - 35, 48, 19, 19);
		ctx.font = '15.3px Minecraft';
		ctx.fillStyle = '#d1d1d1';
		ctx.textAlign = 'right';
		ctx.fillText(canvasIsExtremelyDumb, lineStartAt - 40, 64);
		// Creating a new message attachment
		const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'));
		// Send reply
		await interaction.reply({ files: [attachment] });
	}
}
