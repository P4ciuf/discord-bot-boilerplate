import { Client, Collection } from "discord.js";
import { Command } from "../types/Command";

export interface CustomClient extends Client {
  commands: Collection<string, Command>;
  cooldowns: Collection<string, Collection<string, number>>;
}
