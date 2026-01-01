import { Client, Collection, GatewayIntentBits } from "discord.js";
import { Button, Command, Menu, Modal } from "../types";

interface ExtendedClient extends Client {
  commands: Collection<string, Command>;
  buttons: Collection<string, Button>;
  modals: Collection<string, Modal>;
  menus: Collection<string, Menu>;
}

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
  ],
}) as ExtendedClient;

client.buttons = new Collection<string, Button>();
client.commands = new Collection<string, Command>();
client.modals = new Collection<string, Modal>();
client.menus = new Collection<string, Menu>();
