import { Message, Events, EmbedBuilder } from "discord.js";
import ms from "ms";
import { MessageCommand } from "@/types";

export default {
	name: "ping",
	event: Events.MessageCreate,
	async execute(msg: Message): Promise<void> {
		// Format bot uptime in human-readable format
		const uptime: string = ms(msg.client.uptime, { long: true });

		await msg.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle("Ping")
					.setDescription(`**Ping**: ${msg.client.ws.ping}ms\n**Uptime**: ${uptime}`)
					.setThumbnail(msg.client.user.displayAvatarURL({ extension: "webp" }))
					.setFooter({
						text: "Made by P4ciuf",
						iconURL: msg.client.user.displayAvatarURL({ extension: "webp" }),
					}),
			],
		});
	},
} as MessageCommand;
