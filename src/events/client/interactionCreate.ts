import { Events, type Interaction } from "discord.js";

import { Event, Modal } from "../../types";
import { client } from "../../core/client";
import { createEphemeralErrorMessage, createErrorMessage } from "../../utils/embedCreate";

export default {
  name: Events.InteractionCreate,
  async execute(...args: unknown[]) {
    const interaction = args[0] as Interaction;

    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) {
          console.warn(`Command ${interaction.commandName} not found`);
          return;
        }

        await command.execute(interaction);
      }

      if (interaction.isButton()) {
        const button = Array.from(client.buttons.values()).find((btn) => {
          if (typeof btn.customId === "function") {
            return (btn.customId as (id: string) => boolean)(interaction.customId);
          }
          return btn.customId === interaction.customId;
        });

        if (!button) {
          console.warn(`Button ${interaction.customId} not found`);
          return;
        }

        await button.execute(interaction);
      }

      if (interaction.isModalSubmit()) {
        let modal: Modal | null = null;

        for (const mdl of client.modals.values()) {
          if (typeof mdl.customId === "function") {
            if ((mdl.customId as (id: string) => boolean)(interaction.customId) === true) {
              modal = mdl;
              break;
            }
          } else if (mdl.customId === interaction.customId) {
            modal = mdl;
            break;
          }
        }

        if (!modal) {
          console.warn(`Modal ${interaction.customId} not found`);
          return;
        }
        await modal.execute(interaction);
      }

      if (interaction.isStringSelectMenu()) {
        const menu = Array.from(client.menus.values()).find((mnu) => {
          if (typeof mnu.customId === "function") {
            return (mnu.customId as (id: string) => boolean)(interaction.customId);
          }
          return mnu.customId === interaction.customId;
        });

        if (!menu) {
          console.warn(`Menu ${interaction.customId} not found`);
          return;
        }
        await menu.execute(interaction);
      }
    } catch (e) {
      try {
        console.error(`Error in interaction ${interaction.id}:`, e);

        if (interaction.isRepliable()) {
          if (interaction.deferred) {
            await interaction.editReply(createErrorMessage());
          } else if (!interaction.replied) {
            await interaction.reply(createEphemeralErrorMessage());
          }
        }
      } catch (err) {
        console.error(`Error in error response to interaction ${interaction.id}:`, err);
      }
    }
  },
} as Event;
