import { ButtonInteraction } from "discord.js";

export type Button = {
  customId: string | ((id: string) => boolean);
  execute: (interaction: ButtonInteraction) => Promise<void>;
};
