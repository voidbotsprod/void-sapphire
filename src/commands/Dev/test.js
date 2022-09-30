import { Command } from '@sapphire/framework';
import { createCanvas, Image, loadImage } from 'canvas';
import { MessageAttachment } from 'discord.js';
import { cutTo, softWrap, contrast } from '#lib/functions'

export class TestCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'test',
            description: 'Testing.',
            preconditions: ["ownerOnly"]
        });
    }

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => {
            builder
                .setName(this.name)
                .setDescription(this.description)
        }, {
            guildIds: ['975124858298040451'], // guilds for the command to be registered in; global if empty
            idHints: '1018626869777670174', // commandId, define after registering (id will be in log after first run)
        })
    }

    async chatInputRun(interaction) {
        // Creating the canvas
        const canvas = createCanvas(700, 250);
        const ctx = canvas.getContext('2d');
        ctx.quality = 'fast';

        // Drawing the background and base
        ctx.fillStyle = '#2C2F33';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const base = new Image();
        base.onload = () => ctx.drawImage(base, 0, 0, canvas.width, canvas.height);
        base.onerror = err => { throw err }
        base.src = 'src/lib/images/profile/border/base_transparent.png';

        // Create gradient
        const gradient = ctx.createLinearGradient(0, 20, 0, 40);
        gradient.addColorStop(0.0, "white");
        gradient.addColorStop(1.0, "#C0C4D8");
        // Writing the username
        ctx.font = "16px Minecraft";
        ctx.fillStyle = gradient;
        ctx.textAlign = "center";
        ctx.fillText(cutTo(interaction.user.username, 0, 19, true), 110, 40);

        // Top line
        ctx.strokeStyle = '#36373D';
        ctx.beginPath();
        ctx.lineTo(20, 50);
        ctx.lineTo(base.width - 20, 50);
        ctx.stroke();

        // Far left line
        ctx.strokeStyle = '#36373D';
        ctx.beginPath();
        ctx.lineTo(20, 20);
        ctx.lineTo(20, 230);
        ctx.stroke();

        // "Crossing" line
        ctx.strokeStyle = '#36373D';
        ctx.beginPath();
        ctx.lineTo(200, 20);
        ctx.lineTo(200, 230);
        ctx.stroke();

        // Drawing the avatar
        const avatar = await loadImage(interaction.user.displayAvatarURL({ format: 'png', size: 256 }));
        ctx.drawImage(avatar, 60, 90, 100, 100);
        contrast(ctx, 60, 90, 100, 100, 8.5);

        // Drawing the frame around the avatar
        const frame_rookie = await loadImage('src/lib/images/profile/avatarBorder/1_frame_rookie.png');
        const frame_recruit = await loadImage('src/lib/images/profile/avatarBorder/2_frame_recruit.png');
        const frame_scout = await loadImage('src/lib/images/profile/avatarBorder/3_frame_scout.png');
        const frame_knight = await loadImage('src/lib/images/profile/avatarBorder/4_frame_knight.png');
        const frame_king = await loadImage('src/lib/images/profile/avatarBorder/5_frame_king.png');
        const frame_emperor = await loadImage('src/lib/images/profile/avatarBorder/6_frame_emperor.png');
        const frame_overlord = await loadImage('src/lib/images/profile/avatarBorder/7_frame_overlord.png');

        let frame = frame_rookie;
        ctx.drawImage(frame, 60, 90, 100, 100);

        // Drawing the user level icon and text
        let currentLevel = 1;
        let currentXP = 0;
        let coins = 0;
        const levelIcon = await loadImage('src/lib/images/profile/gui/levelIcon.png');
        ctx.drawImage(levelIcon, 210, 22, 19, 19);
        ctx.font = "16px Minecraft";
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = "left";
        ctx.fillText(currentLevel, 235, 38);

        // Drawing the user XP icon and text
        const levelLength = ctx.measureText(currentLevel);
        const xpIcon = await loadImage('src/lib/images/profile/gui/xpIcon.png');
        ctx.drawImage(xpIcon, 230 + levelLength.width + 15, 22, 19, 19);
        ctx.font = "16px Minecraft";
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = "left";
        ctx.fillText(currentXP, 250 + levelLength.width + 24, 38);

        // Drawing the user coins icon and text starting from the right
        const coinsIcon = await loadImage('src/lib/images/profile/gui/coinIcon.png');
        ctx.drawImage(coinsIcon, base.width - 40, 22, 18, 18);
        ctx.font = "16px Minecraft";
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = "right";
        ctx.fillText(coins, base.width - 50, 38);

        // Drawing inventory slots in a grid
        const slot = await loadImage('src/lib/images/profile/gui/inventorySlot.png');
        const slotCount = 20;
        const slotGapX = 17;
        const slotGapY = 17;
        for (let i = 0; i < slotCount; i++) {
            ctx.drawImage(slot, 210 + (i % 5) * (30 + slotGapX), 60 + Math.floor(i / 5) * (30 + slotGapY), 30, 30);
        }

        // Drawing lorem ipsum text starting from the right end of the base
        ctx.font = "16px Minecraft";
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = "right";
        ctx.fillText(`• Stat One: 10\n \n• Stat Two: 20\n \n• Stat Three: 30\n \n• Stat Four: 40\n \n• Stat Five: 50`, base.width - 100, 72);

        // Creating a new message attachment
        const attachment = new MessageAttachment(canvas.toBuffer(), 'test-image.png');

        await interaction.reply({ files: [attachment] });
    }
}