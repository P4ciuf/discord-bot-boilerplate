import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../../types";
import ms from "ms";

export default {
  syntax: "/ping",
  description: "Show ping and uptime",
  category: "Utility",
  data: new SlashCommandBuilder().setName("ping").setDescription("Show ping and uptime"),
  async execute(interaction) {
    const ping = interaction.client.ws.ping + "ms\n";
    const uptime = ms(interaction.client.uptime);

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Ping")
          .setDescription("**Ping:**" + ping + "**Uptime:**" + uptime)
          .setThumbnail(interaction.client.user.displayAvatarURL({ extension: "webp" }))
          .setFooter({
            text: "omnia.techtribestudio.com",
            iconURL: interaction.client.user.displayAvatarURL({ extension: "webp" }),
          }),
      ],
    });
  },
} as Command;
