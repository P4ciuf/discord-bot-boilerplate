import { StringSelectMenuInteraction } from "discord.js";

export interface Menu {
  customId: string;
  execute: (interaction: StringSelectMenuInteraction) => Promise<void>;
}
