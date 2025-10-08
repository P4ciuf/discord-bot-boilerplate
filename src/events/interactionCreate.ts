import { Events, MessageFlags, Interaction } from "discord.js";
import logger from "../utils/logger";
import { Command } from "../types/Command";
import { CustomClient } from "../types/CustomClient";

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    const client = interaction.client as CustomClient;

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName) as
      | Command
      | undefined;

    if (!command) {
      logger.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error: any) {
      logger.error(`Error executing ${interaction.commandName}: ${error}`);

      const errorMessage: any = {
        content: "An error occurred while executing this command!",
        flags: MessageFlags.Ephemeral,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    }
  },
};
