import { ModalSubmitInteraction } from "discord.js";

export type Modal = {
  customId: string | ((id: string) => boolean);
  execute: (interaction: ModalSubmitInteraction) => void;
};
