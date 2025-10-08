import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "./../../types/Command";
import logger from "../../utils/logger";
import createErrorEmbed from "../../utils/errorEmbed";
import formatUptime from "../../utils/formatUptime";

const pingCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Show bot latency and uptime"),

  execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
    try {
      const ping: number = Math.round(interaction.client.ws.ping ?? -1);
      const uptime: number = interaction.client.uptime ?? 0;

      if (ping === -1) {
        await interaction.reply({content: "Wait a minute and try the command again", flags: 64});
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle("Ping")
        .addFields(
          { name: "Ping", value: `${ping}ms`, inline: true },
          {
            name: "Uptime",
            value: formatUptime(uptime).toString(),
            inline: true,
          }
        )
        .setFooter({
          text: "Made by P4ciuf",
          iconURL: interaction.client.user?.displayAvatarURL({
            extension: "webp",
          }),
        });

      await interaction.reply({ embeds: [embed] });
    } catch (e: any) {
      logger.error(e);

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          embeds: [createErrorEmbed(interaction.client, e)],
          flags: 64,
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed(interaction.client, e)],
          flags: 64,
        });
      }
    }
  },
};

export default pingCommand;
