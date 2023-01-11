import { Command } from '@sapphire/framework';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { AttachmentBuilder } from 'discord.js';
import { cutTo, softWrap, contrast, DB } from '#lib/functions'
import { getColor } from '#lib/color-thief-node';
import { request } from 'undici';
import approx from "approximate-number"

export class ProfileCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'profile',
            description: 'Profile viewer.',
            preconditions: ["ownerOnly", 'insertGuildsAndUsers']
        });
    }

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => {
            builder
                .setName(this.name)
                .setDescription(this.description)
        }, {
            guildIds: ['975124858298040451'], // guilds for the command to be registered in; global if empty
            idHints: '1028691095657394236', // commandId, define after registering (id will be in log after first run)
        })
    }

    async chatInputRun(interaction) {
        const { Coins, Xp } = await DB(`SELECT * FROM users WHERE id = ?`, [interaction.user.id]);
        const baseFramesURL = 'src/lib/images/profile/avatarBorder/';
        const frames = {
            frame_rookie: '1_frame_rookie.png',
            frame_recruit: '2_frame_recruit.png',
            frame_scout: '3_frame_scout.png',
            frame_knight: '4_frame_knight.png',
            frame_king: '5_frame_king.png',
            frame_emperor: '6_frame_emperor.png',
            frame_overlord: '7_frame_overlord.png'
        }
        const canvas = createCanvas(700, 250);
        const ctx = canvas.getContext('2d');
        ctx.quality = 'fast';
        const lightGrayGradient = ctx.createLinearGradient(0, 20, 0, 40);
        lightGrayGradient.addColorStop(0.0, "white");
        lightGrayGradient.addColorStop(1.0, "#C0C4D8");

        // Draw background and load base image
        ctx.fillStyle = '#2C2F33';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const base = await loadImage("src/lib/images/profile/border/base_transparent.png");
        ctx.drawImage(base, 0, 0, canvas.width, canvas.height);

        // Top line
        this.drawLine(ctx, 20, 50, base.width - 20, 50, '#36373D', 0.5);
        // Far left line
        this.drawLine(ctx, 20, 20, 20, 230, '#36373D', 0.5);
        // Middle left "Crossing" line
        this.drawLine(ctx, 200, 20, 200, 230, '#36373D', 0.5);
        // Middle right "Crossing" line
        this.drawLine(ctx, 437, 50, 437, 230, '#36373D', 0.5);

        // Guild
        ctx.font = "20px Minecraft";
        ctx.fillStyle = lightGrayGradient;
        ctx.textAlign = "center";
        ctx.fillText(cutTo(interaction.guild.name, 0, 14, true), 110, 40);

        // Avatar
        const { body } = await request(interaction.user.displayAvatarURL({ extension: 'png', size: 256 }));
        const avatar = await loadImage(await body.arrayBuffer());
        ctx.drawImage(avatar, 60, 90, 100, 100);
        contrast(ctx, 60, 90, 100, 100, 8.5);

        // Username
        const dominantColorRGB = await getColor(interaction.user.displayAvatarURL({ extension: 'png', size: 256 }));
        const dominantColorHEX = `#${dominantColorRGB[0].toString(16)}${dominantColorRGB[1].toString(16)}${dominantColorRGB[2].toString(16)}`;

        ctx.font = "16px Minecraft";
        ctx.fillStyle = "#000000";
        ctx.fillText(cutTo(interaction.user.username, 0, 19, true), 109, 76);
        ctx.fillStyle = dominantColorHEX;
        ctx.textAlign = "center";
        ctx.fillText(cutTo(interaction.user.username, 0, 19, true), 110, 75);

        // Frame around avatar
        let frame = await loadImage(baseFramesURL + frames.frame_rookie);
        ctx.drawImage(frame, 60, 90, 100, 100);

        // Level icon and text
        let currentLevel = `${Math.floor(Xp / 5000) + 1}`;
        const levelIcon = await loadImage('src/lib/images/profile/gui/levelIcon.png');
        ctx.drawImage(levelIcon, 210, 22, 19, 19);
        ctx.font = "16px Minecraft";
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = "left";
        ctx.fillText(currentLevel, 235, 38);

        // XP icon and text
        const levelLength = ctx.measureText(currentLevel);
        const xpIcon = await loadImage('src/lib/images/profile/gui/xpIcon.png');
        ctx.drawImage(xpIcon, 230 + levelLength.width + 15, 22, 19, 19);
        ctx.font = "16px Minecraft";
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = "left";
        ctx.fillText(approx(await Xp), 250 + levelLength.width + 24, 38);

        // Coins icon and text
        const coinsIcon = await loadImage('src/lib/images/profile/gui/coinIcon.png');
        ctx.drawImage(coinsIcon, base.width - 40, 22, 18, 18);
        ctx.font = "16px Minecraft";
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = "right";
        ctx.fillText(approx(await Coins, { min10k: true }), base.width - 48, 37);

        await this.drawInventory(ctx);

        // Stats text
        ctx.font = "16px Minecraft";
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = "left";
        ctx.fillText(`• Stat One: 10`, 447, 78);
        ctx.fillText(`• Stat Two: 20`, 447, 125);
        ctx.fillText(`• Stat Three: 30`, 447, 172);

        ctx.font = "8px Minecraft";
        ctx.fillStyle = '#474A4D';
        ctx.fillText(cutTo(`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`, 0, 60, true), 447, 219);

        // Stats subtext
        ctx.font = "10px Minecraft";
        ctx.fillStyle = '#CDCDCE';
        ctx.textAlign = "left";
        ctx.fillText(cutTo(`More detailed explanation of something or other.`, 0, 40), 457, 93);
        ctx.fillText(cutTo(`More detailed explanation of something or other.`, 0, 40), 457, 140);
        ctx.fillText(cutTo(`More detailed explanation of something or other.`, 0, 40), 457, 187);

        // Creating a new message attachment
        const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'));

        await interaction.reply({ files: [attachment] });
    }

    async drawInventory(ctx) {
        // Drawing inventory slots in a grid
        const slot = await loadImage('src/lib/images/profile/gui/inventorySlot.png');
        const slotCount = 20;
        const slotGapX = 17;
        const slotGapY = 17;
        for (let i = 0; i < slotCount; i++) {
            ctx.drawImage(slot, 210 + (i % 5) * (30 + slotGapX), 60 + Math.floor(i / 5) * (30 + slotGapY), 30, 30);
        }
    }

    drawLine(ctx, x1, y1, x2, y2, color, width) {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}