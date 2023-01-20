import { Command } from '@sapphire/framework';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { AttachmentBuilder } from 'discord.js';
import { cutTo, contrast, DB, colorLuminance } from '#lib/functions';
import { getColor } from '#lib/color-thief-node';
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
				builder.setName(this.name).setDescription(this.description);
			},
			{
				guildIds: ['975124858298040451'], // guilds for the command to be registered in; global if empty
				idHints: '1028691095657394236' // commandId, define after registering (id will be in log after first run)
			}
		);
	}

	async chatInputRun(interaction) {
		try {
			// Create canvas
			const canvas = createCanvas(700, 250);
			const ctx = canvas.getContext('2d');
			ctx.antialias = 'none';
			ctx.patternQuality = 'fast';
			ctx.textDrawingMode = 'glyph';
			ctx.imageSmoothingEnabled = false;
			// Define stuff for later
			const { Id, Coins, Xp } = await DB(`SELECT * FROM users WHERE id = ?`, [interaction.user.id]);
			let currentLevel = Math.floor(Xp / 5000) + 1;
			// Draw background and load base image
			ctx.fillStyle = '#2C2F33';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			const base = await loadImage('src/lib/images/profile/border/base_transparent.png');
			ctx.drawImage(base, 0, 0, canvas.width, canvas.height);
			// Top line
			this.drawLine(ctx, 20, 50, base.width - 20, 50, '#36373D', 0.5);
			// Far left line
			this.drawLine(ctx, 20, 20, 20, 230, '#36373D', 0.5);
			// Middle left "Crossing" line
			this.drawLine(ctx, 200, 20, 200, 230, '#36373D', 0.5);
			// Middle right "Crossing" line
			this.drawLine(ctx, 437, 50, 437, 230, '#36373D', 0.5);
			// Draw elements
			await this.drawPlayerCard(ctx, interaction, currentLevel);
			await this.drawInventory(ctx, interaction);
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

	async drawInventory(ctx, interaction) {
		try {
			const [items] = await DB('SELECT * FROM useritems WHERE UserId = ?', [interaction.user.id], true);
			// Drawing inventory slots in a grid
			const slotImage = await loadImage('src/lib/images/profile/gui/inventorySlot.png');
			const slotRows = 3; // Rows are horizontal
			const slotColumns = 4; // Columns are vertical
			const slotGap = 15;
			const slotSize = 43;
			// Draw slots
			for (let i = 0; i < slotRows * slotColumns; i++) {
				const x = 209 + (i % slotColumns) * (slotSize + slotGap);
				const y = 59 + Math.floor(i / slotColumns) * (slotSize + slotGap);
				ctx.drawImage(slotImage, x, y, slotSize, slotSize);
			}
			// Draw items
			if (items) {
				for (let i = 0; i < Math.min(items.length, 12); i++) {
					if (i > 12) return;
					// Set draw location
					const x = 210 + (i % slotColumns) * (slotSize + slotGap);
					const y = 60 + Math.floor(i / slotColumns) * (slotSize + slotGap);
					const currentItem = itemList.find((item) => item.Id === items[i].ItemTypeId);
					const itemTexture = await loadImage(`src/lib/images/items/${currentItem.Name}.png`).catch(() => {});
					const fallbackTexture = await loadImage(`src/lib/images/items/default.png`);
					const item = itemTexture !== undefined ? itemTexture : fallbackTexture;
					ctx.drawImage(item, x, y, slotSize - 2, slotSize - 2);
					const rarity = rarityList.find((rarity) => rarity.Id === currentItem.Rarity);
					const colorValue = colorList.find((color) => color.Id === rarity.ColorId).Value;
					// Draw item name under slot
					ctx.font = '10px Minecraft';
					const luminance = colorLuminance(colorValue);
					ctx.fillStyle = luminance.amount > 0.5 ? '#aeaeae' : '#1e1e1e';
					ctx.textAlign = 'center';
					ctx.fillText(cutTo(currentItem.DecoName, 0, 8, true), x + 20, y + 54);
					ctx.fillStyle = colorValue;
					ctx.fillText(cutTo(currentItem.DecoName, 0, 8, true), x + 21, y + 53);
				}
			}
		} catch (error) {
			console.log(error);
		}
	}

	async drawPlayerCard(ctx, interaction, currentLevel) {
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
		const { body } = await request(interaction.user.displayAvatarURL({ extension: 'png', size: 256 }));
		const avatar = await loadImage(await body.arrayBuffer());
		ctx.drawImage(avatar, 60, 90, 100, 100);
		contrast(ctx, 60, 90, 100, 100, 8.5);
		// Username
		const dcRGB = await getColor(interaction.user.displayAvatarURL({ extension: 'png', size: 256 }), 10);
		const dcHEX = '#' + ((1 << 24) + (dcRGB[0] << 16) + (dcRGB[1] << 8) + dcRGB[2]).toString(16).slice(1);
		ctx.font = '20px Minecraft';
		const luminance = colorLuminance(dcHEX);
		ctx.fillStyle = luminance.amount > 0.5 ? '#aeaeae' : '#1e1e1e';
		ctx.fillText(cutTo(interaction.user.username, 0, 13, true), 109, 76);
		ctx.fillStyle = dcHEX;
		ctx.textAlign = 'center';
		ctx.fillText(cutTo(interaction.user.username, 0, 13, true), 110, 75);
		// Frame around avatar
		let fitsWithinLevel;
		for (const [level] of Object.entries(frames)) {
			if (currentLevel < level) {
				fitsWithinLevel = level;
				break;
			}
		}

		const frame = await loadImage(baseFramesURL + frames[fitsWithinLevel]);
		ctx.drawImage(frame, 60, 90, 100, 100);
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

	drawLine(ctx, x1, y1, x2, y2, color, width) {
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
}
