import { Command } from '@sapphire/framework';
import { createCanvas, Image, loadImage } from 'canvas';
import { MessageAttachment } from 'discord.js';
import { cutTo } from '#lib/functions'

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
        base.src = 'src/lib/images/base_transparent.png';

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

        // Drawing the frame around the avatar
        const frame_rookie = await loadImage('src/lib/images/1_frame_rookie.png');
        const frame_recruit = await loadImage('src/lib/images/2_frame_recruit.png');
        const frame_scout = await loadImage('src/lib/images/3_frame_scout.png');
        const frame_knight = await loadImage('src/lib/images/4_frame_knight.png');

        let frame = frame_knight;
        ctx.drawImage(frame, 60, 90, 100, 100);

        // Creating a new message attachment
        const attachment = new MessageAttachment(canvas.toBuffer(), 'test-image.png');

        await interaction.reply({ files: [attachment] });
    }
}