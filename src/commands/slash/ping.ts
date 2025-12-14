import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import ms from "ms";
import { Command } from "@/types";

export default {
	data: new SlashCommandBuilder().setName("ping").setDescription("Show bot ping and uptime"),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ flags: 64 }); // MessageFlags.Ephemeral

		// Format bot uptime in human-readable format
		const uptime: string = ms(interaction.client.uptime, { long: true });

		await interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setTitle("Ping")
					.setDescription(
						`**Ping**: ${interaction.client.ws.ping}ms\n**Uptime**: ${uptime}`,
					)
					.setThumbnail(interaction.client.user.displayAvatarURL({ extension: "webp" }))
					.setFooter({
						text: "Made by P4ciuf",
						iconURL: interaction.client.user.displayAvatarURL({ extension: "webp" }),
					}),
			],
		});
	},
} as Command;
