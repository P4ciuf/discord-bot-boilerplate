import { Events, Message } from "discord.js";

export interface MessageCommand {
  name: string;
  event: Events.MessageCreate;
  execute: (message: Message) => {} | void;
}
